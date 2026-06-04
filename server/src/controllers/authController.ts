import type { Request, Response } from "express";
import { User } from "../lib/schema";
import { loginUserSchema, validateData } from "../lib/validation";
import { comparePassword, generateToken, hashPassword } from "../lib/auth";
import { createUserSchema } from "../lib/validation";
import { sendEmailOtp } from "../lib/mailer";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

/**
 * Sign up a new user
 */
export const signup = async (req: Request, res: Response) => {
  try {
    const result = validateData(createUserSchema, req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const userData = result.data as any;
    const email = userData.email.toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists with this email" });
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create user with hashed password
    const user = await User.create({
      email,
      password: hashedPassword,
      name: userData.name,
    });

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to sign up";
    const statusCode = message.includes("already exists") ? 409 : 500;
    res.status(statusCode).json({ error: message });
  }
};

/**
 * Sign in user
 */
export const signin = async (req: Request, res: Response) => {
  try {
    const result = validateData(loginUserSchema, req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Find user by email
    const email = (result.data as any).email.toLowerCase();
    const user = await User.findOne({ email }).select("+password +twoFactorOtp +twoFactorOtpExpires");
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Verify password
    const isPasswordValid = await comparePassword((result.data as any).password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Handle 2FA
    if (user.isTwoFactorEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.twoFactorOtp = otp;
      user.twoFactorOtpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      await user.save();

      await sendEmailOtp(user.email, otp);

      const tempToken = jwt.sign({ tempUserId: user._id.toString() }, JWT_SECRET, { expiresIn: "5m" });

      return res.json({
        requires2FA: true,
        tempToken,
        message: "2FA OTP sent to your email",
      });
    }

    // Generate normal token
    const token = generateToken(user._id.toString());

    res.json({
      message: "Sign in successful",
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to sign in";
    res.status(500).json({ error: message });
  }
};

/**
 * Verify 2FA OTP for Login
 */
export const verify2FA = async (req: Request, res: Response) => {
  try {
    const { tempToken, otp } = req.body;
    if (!tempToken || !otp) {
      return res.status(400).json({ error: "tempToken and otp are required" });
    }

    const decoded = jwt.verify(tempToken, JWT_SECRET) as { tempUserId: string };
    const user = await User.findById(decoded.tempUserId).select("+twoFactorOtp +twoFactorOtpExpires");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.twoFactorOtp || user.twoFactorOtp !== otp) {
      return res.status(401).json({ error: "Invalid OTP" });
    }

    if (user.twoFactorOtpExpires && user.twoFactorOtpExpires < new Date()) {
      return res.status(401).json({ error: "OTP expired" });
    }

    // Clear OTP
    user.twoFactorOtp = undefined;
    user.twoFactorOtpExpires = undefined;
    await user.save();

    const token = generateToken(user._id.toString());
    res.json({
      message: "2FA Verification successful",
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: unknown) {
    return res.status(401).json({ error: "Invalid or expired temp token" });
  }
};

/**
 * Enable 2FA: Sends an OTP to the currently logged in user to confirm enablement
 */
export const enable2FA = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.twoFactorOtp = otp;
    user.twoFactorOtpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendEmailOtp(user.email, otp);

    res.json({ message: "OTP sent to email. Please verify to enable 2FA." });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to initiate 2FA";
    res.status(500).json({ error: message });
  }
};

/**
 * Confirm Enable 2FA: Verifies the OTP and turns on 2FA
 */
export const confirmEnable2FA = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { otp } = req.body;
    
    if (!otp) {
      return res.status(400).json({ error: "OTP is required" });
    }

    const user = await User.findById(userId).select("+twoFactorOtp +twoFactorOtpExpires");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.twoFactorOtp || user.twoFactorOtp !== otp) {
      return res.status(401).json({ error: "Invalid OTP" });
    }

    if (user.twoFactorOtpExpires && user.twoFactorOtpExpires < new Date()) {
      return res.status(401).json({ error: "OTP expired" });
    }

    user.isTwoFactorEnabled = true;
    user.twoFactorOtp = undefined;
    user.twoFactorOtpExpires = undefined;
    await user.save();

    res.json({ message: "2FA successfully enabled" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to confirm 2FA";
    res.status(500).json({ error: message });
  }
};


/**
 * Get current user profile
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch user";
    res.status(500).json({ error: message });
  }
};

/**
 * Logout (client-side: just delete token)
 */
export const logout = async (req: Request, res: Response) => {
  res.json({ message: "Logged out successfully" });
};

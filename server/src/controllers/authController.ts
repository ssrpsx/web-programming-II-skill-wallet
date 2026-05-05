import type { Request, Response } from "express";
import { User } from "../lib/schema";
import { loginUserSchema, validateData } from "../lib/validation";
import { comparePassword, generateToken, hashPassword } from "../lib/auth";
import { createUserSchema } from "../lib/validation";

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
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Verify password
    const isPasswordValid = await comparePassword((result.data as any).password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate token
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

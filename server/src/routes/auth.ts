import { Router } from "express";
import type { Request, Response } from "express";
import * as authController from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import { getGoogleAuthUrl, getGoogleUserInfo } from "../lib/google-oauth";
import { generateToken } from "../lib/auth";
import { User } from "../lib/schema";

const router = Router();

router.post("/signup", authController.signup);
router.post("/signin", authController.signin);

// 2FA Routes
router.post("/2fa/verify", authController.verify2FA);
router.post("/2fa/enable", authMiddleware, authController.enable2FA);
router.post("/2fa/confirm", authMiddleware, authController.confirmEnable2FA);

router.get("/me", authMiddleware, authController.getCurrentUser);
router.post("/logout", authMiddleware, authController.logout);

// Google OAuth2 Routes (using google-auth-library)
router.get("/google", (_req: Request, res: Response) => {
  const authUrl = getGoogleAuthUrl();
  res.redirect(authUrl);
});

router.get("/google/callback", async (req: Request, res: Response) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  try {
    const code = req.query.code as string;
    if (!code) {
      return res.redirect(`${frontendUrl}/signin?error=oauth_failed`);
    }

    const googleUser = await getGoogleUserInfo(code);

    if (!googleUser.email) {
      return res.redirect(`${frontendUrl}/signin?error=no_email`);
    }

    const email = googleUser.email.toLowerCase();
    let user = await User.findOne({ email });

    if (user) {
      if (!user.oauthProvider) {
        user.oauthProvider = "google";
        user.oauthId = googleUser.id;
        await user.save();
      }
    } else {
      user = await User.create({
        email,
        name: googleUser.name || "Google User",
        oauthProvider: "google",
        oauthId: googleUser.id,
        photo: googleUser.picture,
      });
    }

    const token = generateToken(user._id.toString());
    res.redirect(`${frontendUrl}/api/auth/google-callback?token=${token}`);
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    res.redirect(`${frontendUrl}/signin?error=oauth_failed`);
  }
});

export default router;

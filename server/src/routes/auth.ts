import { Router } from "express";
import * as authController from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import passport from "../lib/oauth";
import { generateToken } from "../lib/auth";

const router = Router();

router.post("/signup", authController.signup);
router.post("/signin", authController.signin);

// 2FA Routes
router.post("/2fa/verify", authController.verify2FA);
router.post("/2fa/enable", authMiddleware, authController.enable2FA);
router.post("/2fa/confirm", authMiddleware, authController.confirmEnable2FA);

router.get("/me", authMiddleware, authController.getCurrentUser);
router.post("/logout", authMiddleware, authController.logout);

// OAuth2 Google Routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login?error=oauth_failed" }),
  (req, res) => {
    // Generate token and redirect to frontend with token
    if (req.user) {
      const user = req.user as any;
      const token = generateToken(user._id.toString());
      // Get the frontend URL from environment or use a default
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      res.redirect(`${frontendUrl}/auth/success?token=${token}`);
    } else {
      res.redirect("/login?error=oauth_failed");
    }
  }
);

export default router;

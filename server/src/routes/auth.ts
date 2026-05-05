import { Router } from "express";
import * as authController from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.get("/me", authMiddleware, authController.getCurrentUser);
router.post("/logout", authMiddleware, authController.logout);

export default router;

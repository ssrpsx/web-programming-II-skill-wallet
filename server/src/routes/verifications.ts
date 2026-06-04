import { Router } from "express";
import * as verificationController from "../controllers/verificationController";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";

const router = Router();

// Public endpoints - no auth required
router.get("/user/:userId/public", verificationController.getPublicUserPortfolio);
router.get("/:id/public", verificationController.getPublicVerification);

// Only authenticated users can request or view verifications
router.post("/", authMiddleware, verificationController.createVerification);
router.get("/", authMiddleware, verificationController.getAllVerifications);
router.post("/:id/submit", authMiddleware, verificationController.submitAnswers);

// Initiation and retry can be done by users
router.post("/:id/p2p/initiate", authMiddleware, verificationController.initiateP2P);
router.post("/:id/interview/initiate", authMiddleware, verificationController.initiateInterview);
router.post("/:id/retry", authMiddleware, verificationController.retryChoice);

// Level completion: permission checked inside controller per level type
router.patch("/:id/levels/:level/complete", authMiddleware, verificationController.completeLevel);

router.get("/:id", authMiddleware, verificationController.getVerificationById);
router.patch("/:id", authMiddleware, requireRole(["interviewer"]), verificationController.updateVerification);
router.delete("/:id", authMiddleware, requireRole(["interviewer"]), verificationController.deleteVerification);

export default router;

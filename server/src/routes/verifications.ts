import { Router } from "express";
import * as verificationController from "../controllers/verificationController";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";

const router = Router();

// Only authenticated users can request or view verifications
router.post("/", authMiddleware, verificationController.createVerification);
router.get("/", authMiddleware, verificationController.getAllVerifications);
router.post("/:id/submit", authMiddleware, verificationController.submitAnswers);

// Initiation and retry can be done by users
router.post("/:id/p2p/initiate", authMiddleware, verificationController.initiateP2P);
router.post("/:id/interview/initiate", authMiddleware, verificationController.initiateInterview);
router.post("/:id/retry", authMiddleware, verificationController.retryChoice);

// Interviewers can complete levels
router.patch("/:id/levels/:level/complete", authMiddleware, requireRole(["interviewer"]), verificationController.completeLevel);

router.get("/:id", authMiddleware, verificationController.getVerificationById);
router.patch("/:id", authMiddleware, requireRole(["interviewer"]), verificationController.updateVerification);
router.delete("/:id", authMiddleware, requireRole(["interviewer"]), verificationController.deleteVerification);

export default router;

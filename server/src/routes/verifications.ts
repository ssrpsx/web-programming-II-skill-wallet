import { Router } from "express";
import * as verificationController from "@/controllers/verificationController";

const router = Router();

router.post("/", verificationController.createVerification);
router.get("/", verificationController.getAllVerifications);
router.post("/:id/submit", verificationController.submitAnswers);
router.post("/:id/p2p/initiate", verificationController.initiateP2P);
router.post("/:id/retry", verificationController.retryChoice);
router.patch("/:id/levels/:level/complete", verificationController.completeLevel);
router.get("/:id", verificationController.getVerificationById);
router.patch("/:id", verificationController.updateVerification);
router.delete("/:id", verificationController.deleteVerification);

export default router;

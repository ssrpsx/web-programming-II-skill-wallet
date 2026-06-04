import { Router } from "express";
import * as skillController from "../controllers/skillController";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";

const router = Router();

router.post("/", authMiddleware, requireRole(["interviewer"]), skillController.createSkill);
router.get("/", skillController.getAllSkills);
router.get("/category/:category", skillController.getSkillsByCategory);
router.get("/:id", skillController.getSkillById);
router.patch("/:id", authMiddleware, requireRole(["interviewer"]), skillController.updateSkill);
router.delete("/:id", authMiddleware, requireRole(["interviewer"]), skillController.deleteSkill);

export default router;

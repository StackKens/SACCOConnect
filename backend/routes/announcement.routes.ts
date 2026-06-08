import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
import { getAnnouncements, postAnnouncement, deleteAnnouncement } from "../controllers/announcement.controller";

const router = Router();

router.get("/", authenticate, getAnnouncements);
router.post("/", authenticate, requireAdmin, postAnnouncement);
router.delete("/:id", authenticate, requireAdmin, deleteAnnouncement);

export default router;

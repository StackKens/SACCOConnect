import { Router } from "express";
import { authenticate, requireAdmin, requireMember } from "../middleware/auth.middleware";
import {
  submitContribution,
  getMyContributions,
  getAllContributions,
  recordCashPayment,
  confirmContribution,
} from "../controllers/contribution.controller";

const router = Router();

// Member routes
router.post("/", authenticate, requireMember, submitContribution);
router.get("/my", authenticate, requireMember, getMyContributions);

// Admin routes
router.get("/", authenticate, requireAdmin, getAllContributions);
router.post("/cash", authenticate, requireAdmin, recordCashPayment);
router.post("/:id/confirm", authenticate, requireAdmin, confirmContribution);

export default router;

import { Router } from "express";
import { authenticate, requireAdmin, requireMember } from "../middleware/auth.middleware";
import {
  applyForLoan,
  getMyLoans,
  getMyActiveLoan,
  getLoanQueue,
  getLoanById,
  approveLoan,
  rejectLoan,
  makeRepayment,
  getActiveLoans,
} from "../controllers/loan.controller";

const router = Router();

// Member routes
router.post("/apply", authenticate, requireMember, applyForLoan);
router.get("/my", authenticate, requireMember, getMyLoans);
router.get("/my/active", authenticate, requireMember, getMyActiveLoan);
router.post("/:id/repay", authenticate, requireMember, makeRepayment);

// Admin routes
router.get("/queue", authenticate, requireAdmin, getLoanQueue);
router.get("/active", authenticate, requireAdmin, getActiveLoans);
router.get("/:id", authenticate, authenticate, getLoanById);
router.post("/:id/approve", authenticate, requireAdmin, approveLoan);
router.post("/:id/reject", authenticate, requireAdmin, rejectLoan);

export default router;

import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
import {
  getMySacco,
  addPaymentAccount,
  updatePaymentAccount,
} from "../controllers/sacco.controller";

const router = Router();

router.get("/me", authenticate, getMySacco);
router.post("/payment-accounts", authenticate, requireAdmin, addPaymentAccount);
router.patch(
  "/payment-accounts/:id",
  authenticate,
  requireAdmin,
  updatePaymentAccount,
);

export default router;

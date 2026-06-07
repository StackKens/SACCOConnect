import { Router } from "express";
import { authenticate, requireMember } from "../middleware/auth.middleware";
import {
  getMyGuarantorRequests,
  respondToGuarantorRequest,
} from "../controllers/guarantor.controller";

const router = Router();

router.get("/requests", authenticate, requireMember, getMyGuarantorRequests);
router.post("/requests/:id/respond", authenticate, requireMember, respondToGuarantorRequest);

export default router;

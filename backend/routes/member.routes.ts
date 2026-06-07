import { Router } from "express";
import { authenticate, requireAdmin, requireMember } from "../middleware/auth.middleware";
import {
  getMyProfile,
  updateMyProfile,
  getMyEligibility,
  getAllMembers,
  getMemberById,
  updateMemberStatus,
  generateInviteLink,
  sendInviteSms,
} from "../controllers/member.contoller";

const router = Router();

// Member routes
router.get("/me", authenticate, requireMember, getMyProfile);
router.put("/me", authenticate, requireMember, updateMyProfile);
router.get("/me/eligibility", authenticate, requireMember, getMyEligibility);

// Admin routes
router.get("/", authenticate, requireAdmin, getAllMembers);
router.get("/invite", authenticate, requireAdmin, generateInviteLink);
router.post("/invite/send", authenticate, requireAdmin, sendInviteSms);
router.get("/:id", authenticate, requireAdmin, getMemberById);
router.patch("/:id/status", authenticate, requireAdmin, updateMemberStatus);

export default router;

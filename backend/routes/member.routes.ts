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
  deleteMember,
  getSaccoMembers,
} from "../controllers/member.contoller";

const router = Router();

// Member routes
router.get("/me", authenticate, requireMember, getMyProfile);
router.put("/me", authenticate, requireMember, updateMyProfile);
router.get("/me/eligibility", authenticate, requireMember, getMyEligibility);
router.get("/sacco-members", authenticate, requireMember, getSaccoMembers);

// Admin routes
router.get("/", authenticate, requireAdmin, getAllMembers);
router.get("/invite", authenticate, requireAdmin, generateInviteLink);
router.post("/invite/send", authenticate, requireAdmin, sendInviteSms);
router.get("/:id", authenticate, requireAdmin, getMemberById);
router.patch("/:id/status", authenticate, requireAdmin, updateMemberStatus);
router.delete("/:id", authenticate, requireAdmin, deleteMember);

export default router;

import { Router } from "express";
import {
  requestOTP,
  verifyOTP,
  registerAdmin,
  registerMember,
  login,
  refreshToken,
  validateInviteCode,
} from "../controllers/auth.controller";

const router = Router();

router.post("/otp/request", requestOTP);
router.post("/otp/verify", verifyOTP);
router.post("/register/admin", registerAdmin);
router.post("/register/member", registerMember);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.get("/invite/:code", validateInviteCode);

export default router;

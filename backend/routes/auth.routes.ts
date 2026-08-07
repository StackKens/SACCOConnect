import { Router } from "express";
import {
  requestOTP,
  verifyOTP,
  registerAdmin,
  registerMember,
  login,
  refreshToken,
  logout,
  validateInviteCode,
} from "../controllers/auth.controller";
import { authAttemptLimit, otpRequestLimit } from "../middleware/rateLimiter";

const router = Router();

router.post("/otp/request", otpRequestLimit, requestOTP);
router.post("/otp/verify", authAttemptLimit, verifyOTP);
router.post("/register/admin", registerAdmin);
router.post("/register/member", registerMember);
router.post("/login", authAttemptLimit, login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/invite/:code", validateInviteCode);

export default router;

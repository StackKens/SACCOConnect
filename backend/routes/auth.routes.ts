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
  changePin,
} from "../controllers/auth.controller";
import { authAttemptLimit, otpRequestLimit } from "../middleware/rateLimiter";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/otp/request", otpRequestLimit, requestOTP);
router.post("/otp/verify", authAttemptLimit, verifyOTP);
router.post("/register/admin", registerAdmin);
router.post("/register/member", registerMember);
router.post("/login", authAttemptLimit, login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.put("/pin", authenticate, changePin);
router.get("/invite/:code", validateInviteCode);

export default router;

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/database";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../config/jwt";
import { generateOTP, sendOTP } from "../services/sms.service";
import { paramString } from "../utils/helpers";
import { AppError } from "../middleware/error.middleware";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  sendOTPSchema,
  verifyOTPSchema,
  registerAdminSchema,
  registerMemberSchema,
  loginSchema,
  changePinSchema,
} from "../utils/validators";
import {
  loginEvent,
  pinChangeEvent,
  recordRiskDecision,
  sendEvent,
} from "../services/security-intelligence.service";
import { createSaccoWithAdmin } from "../services/sacco.service";

function eventContext(req: Request) {
  const deviceId = req.headers["x-device-id"];
  const channel = req.headers["x-channel"];
  return {
    channel: (channel === "mobile_app" || channel === "api" ? channel : "web") as
      | "mobile_app"
      | "web"
      | "api",
    ipAddress: req.ip || undefined,
    deviceId: typeof deviceId === "string" ? deviceId : undefined,
  };
}

function riskEnforced(): boolean {
  const raw = process.env.SECURITY_RISK_ENFORCE;
  return raw === undefined || raw === "true" || raw === "1";
}

function blockedRiskLevels(): Set<string> {
  return new Set(
    (process.env.SECURITY_RISK_BLOCK_LEVELS || "high,critical")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

export async function requestOTP(req: Request, res: Response) {
  const { phoneNumber } = sendOTPSchema.parse(req.body);

  const isDev = process.env.NODE_ENV !== "production";
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.otpCode.deleteMany({ where: { phoneNumber } });
  await prisma.otpCode.create({
    data: { phoneNumber, code: otp, expiresAt, used: false },
  });

  await sendOTP(phoneNumber, otp);

  return res.json({
    success: true,
    message: "OTP sent successfully",
    ...(isDev && { dev_otp: otp }),
  });
}

export async function verifyOTP(req: Request, res: Response) {
  const { phoneNumber, code } = verifyOTPSchema.parse(req.body);

  const record = await prisma.otpCode.findFirst({
    where: { phoneNumber, code, used: false },
  });

  if (!record) throw new AppError("Invalid OTP code", 400);
  if (new Date() > record.expiresAt) throw new AppError("OTP has expired", 400);

  await prisma.otpCode.update({
    where: { id: record.id },
    data: { used: true },
  });

  return res.json({ success: true, message: "OTP verified successfully" });
}

export async function registerAdmin(req: Request, res: Response) {
  const data = registerAdminSchema.parse(req.body);

  const existing = await prisma.user.findUnique({
    where: { phoneNumber: data.phoneNumber },
  });
  if (existing) throw new AppError("Phone number already registered", 409);

  const otpUsed = await prisma.otpCode.findFirst({
    where: { phoneNumber: data.phoneNumber, used: true },
  });
  if (!otpUsed) throw new AppError("Phone number not verified", 400);

  const result = await createSaccoWithAdmin({
    phoneNumber: data.phoneNumber,
    pin: data.pin,
    fullName: data.fullName,
    nationalId: data.nationalId,
    saccoName: data.saccoName,
    registrationNo: data.registrationNo,
    contributionAmount: data.contributionAmount,
    maxLoanMultiplier: data.maxLoanMultiplier,
    interestRate: data.interestRate,
    loanTermMonths: data.loanTermMonths,
    meetingDay: data.meetingDay,
    rulesText: data.rulesText,
    countryCode: data.countryCode,
    termsAccepted: data.termsAccepted,
    termsVersion: data.termsVersion,
    paymentAccount: data.paymentAccount,
  });

  const accessToken = generateAccessToken({
    userId: result.user.id,
    role: result.user.role,
    saccoId: result.sacco.id,
  });
  const refreshToken = generateRefreshToken({
    userId: result.user.id,
    role: result.user.role,
    saccoId: result.sacco.id,
  });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: result.user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return res.status(201).json({
    success: true,
    message: "SACCO created successfully",
    data: {
      accessToken,
      refreshToken,
      user: {
        id: result.user.id,
        role: result.user.role,
        phoneNumber: result.user.phoneNumber,
      },
      member: result.member,
      sacco: result.sacco,
    },
  });
}

export async function registerMember(req: Request, res: Response) {
  const data = registerMemberSchema.parse(req.body);

  const sacco = await prisma.sacco.findUnique({
    where: { inviteCode: data.inviteCode },
  });
  if (!sacco) throw new AppError("Invalid invite code", 400);

  const existing = await prisma.user.findUnique({
    where: { phoneNumber: data.phoneNumber },
  });
  if (existing) throw new AppError("Phone number already registered", 409);

  const otpUsed = await prisma.otpCode.findFirst({
    where: { phoneNumber: data.phoneNumber, used: true },
  });
  if (!otpUsed) throw new AppError("Phone number not verified", 400);

  const pinHash = await bcrypt.hash(data.pin, 12);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        phoneNumber: data.phoneNumber,
        pinHash,
        role: "MEMBER",
        saccoId: sacco.id,
      },
    });

    const member = await tx.member.create({
      data: {
        userId: user.id,
        saccoId: sacco.id,
        fullName: data.fullName,
        nationalId: data.nationalId,
      },
    });

    await tx.streak.create({
      data: { memberId: member.id, monthlyRecord: "{}" },
    });

    return { user, member };
  });

  const accessToken = generateAccessToken({
    userId: result.user.id,
    role: result.user.role,
    saccoId: sacco.id,
  });
  const refreshToken = generateRefreshToken({
    userId: result.user.id,
    role: result.user.role,
    saccoId: sacco.id,
  });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: result.user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return res.status(201).json({
    success: true,
    message: "Joined SACCO successfully",
    data: {
      accessToken,
      refreshToken,
      user: {
        id: result.user.id,
        role: result.user.role,
        phoneNumber: result.user.phoneNumber,
      },
      member: result.member,
      sacco,
    },
  });
}

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export async function login(req: Request, res: Response) {
  const { phoneNumber, pin } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { phoneNumber },
    include: {
      member: { include: { streak: true } },
      sacco: true,
    },
  });

  if (!user) throw new AppError("Invalid phone number or PIN", 401);

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    void sendEvent(
      loginEvent(user.id, "failure", eventContext(req), "account_locked"),
    );
    const minutes = Math.ceil(
      (user.lockedUntil.getTime() - Date.now()) / 60000,
    );
    throw new AppError(
      `Account temporarily locked. Try again in ${minutes} minute(s).`,
      429,
    );
  }

  if (!user.isActive) throw new AppError("Account is deactivated", 403);

  const isValid = await bcrypt.compare(pin, user.pinHash);
  if (!isValid) {
    void sendEvent(
      loginEvent(user.id, "failure", eventContext(req), "invalid_credentials"),
    );
    const attempts = user.failedLoginAttempts + 1;
    if (attempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MS),
        },
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: attempts },
      });
    }
    throw new AppError("Invalid phone number or PIN", 401);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });

  const verdict = await sendEvent(loginEvent(user.id, "success", eventContext(req)));

  if (verdict && riskEnforced() && blockedRiskLevels().has(verdict.risk_level)) {
    await recordRiskDecision({
      eventId: verdict.event_id,
      userId: user.id,
      riskLevel: verdict.risk_level,
      decision: "BLOCK",
      reason: verdict.reasons.join("; "),
    });
    throw new AppError(
      "Suspicious login attempt. If this is you, contact your SACCO admin to verify.",
      403,
    );
  }

  await recordRiskDecision({
    eventId: verdict?.event_id ?? null,
    userId: user.id,
    riskLevel: verdict?.risk_level ?? null,
    decision: "ALLOW",
    reason: verdict ? undefined : "engine unreachable — risk intelligence unavailable",
  });

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
    saccoId: user.saccoId || undefined,
  });
  const refreshToken = generateRefreshToken({
    userId: user.id,
    role: user.role,
    saccoId: user.saccoId || undefined,
  });

  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return res.json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      user: { id: user.id, role: user.role, phoneNumber: user.phoneNumber },
      member: user.member,
      sacco: user.sacco,
    },
  });
}

export async function refreshToken(req: Request, res: Response) {
  const { token } = req.body;
  if (!token) throw new AppError("Refresh token required", 400);

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || new Date() > stored.expiresAt)
    throw new AppError("Invalid refresh token", 401);

  const payload = verifyRefreshToken(token);
  const accessToken = generateAccessToken(payload);

  return res.json({ success: true, data: { accessToken } });
}

export async function validateInviteCode(req: Request, res: Response) {
  const code = paramString(req.params, "code");

  const sacco = await prisma.sacco.findUnique({
    where: { inviteCode: code.toUpperCase() },
    include: {
      members: {
        where: { user: { role: "ADMIN" } },
        take: 1,
      },
    },
  });

  if (!sacco) throw new AppError("Invalid invite code", 404);

  const adminMember = sacco.members[0];

  return res.json({
    success: true,
    data: {
      id: sacco.id,
      name: sacco.name,
      contributionAmount: sacco.contributionAmount,
      interestRate: sacco.interestRate,
      loanTermMonths: sacco.loanTermMonths,
      meetingDay: sacco.meetingDay,
      inviteCode: sacco.inviteCode,
      adminName: adminMember?.fullName ?? "SACCO Admin",
      memberCount: await prisma.member.count({ where: { saccoId: sacco.id } }),
    },
  });
}

export async function logout(req: Request, res: Response) {
  const { token } = req.body;
  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }
  return res.json({ success: true, message: "Logged out" });
}

export async function changePin(req: AuthRequest, res: Response) {
  const { currentPin, newPin } = changePinSchema.parse(req.body);
  if (!req.user) throw new AppError("Not authenticated", 401);

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
  });
  if (!user) throw new AppError("User not found", 404);

  const isValid = await bcrypt.compare(currentPin, user.pinHash);
  if (!isValid) throw new AppError("Current PIN is incorrect", 400);

  const pinHash = await bcrypt.hash(newPin, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { pinHash, failedLoginAttempts: 0, lockedUntil: null },
  });

  void sendEvent(pinChangeEvent(user.id, "password", eventContext(req)));

  return res.json({ success: true, message: "PIN updated successfully" });
}


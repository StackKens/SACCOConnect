import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/database";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../config/jwt";
import { generateOTP, sendOTP } from "../services/sms.service";
import { AppError } from "../middleware/error.middleware";
import { generateInviteCode } from "../utils/helpers";
import {
  sendOTPSchema,
  verifyOTPSchema,
  registerAdminSchema,
  registerMemberSchema,
  loginSchema,
} from "../utils/validators";

export async function requestOTP(req: Request, res: Response) {
  const { phoneNumber } = sendOTPSchema.parse(req.body);

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.otpCode.deleteMany({ where: { phoneNumber } });
  await prisma.otpCode.create({ data: { phoneNumber, code: otp, expiresAt } });

  await sendOTP(phoneNumber, otp);

  return res.json({
    success: true,
    message: "OTP sent successfully",
    ...(process.env.NODE_ENV === "development" && { dev_otp: otp }),
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

  const pinHash = await bcrypt.hash(data.pin, 12);
  const inviteCode = generateInviteCode();

  const result = await prisma.$transaction(async (tx) => {
    const sacco = await tx.sacco.create({
      data: {
        name: data.saccoName,
        registrationNo: data.registrationNo,
        contributionAmount: data.contributionAmount,
        maxLoanMultiplier: data.maxLoanMultiplier,
        interestRate: data.interestRate,
        loanTermMonths: data.loanTermMonths,
        meetingDay: data.meetingDay,
        rulesText: data.rulesText,
        inviteCode,
      },
    });

    const user = await tx.user.create({
      data: {
        phoneNumber: data.phoneNumber,
        pinHash,
        role: "ADMIN",
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

    return { user, sacco, member };
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
  if (!user.isActive) throw new AppError("Account is deactivated", 403);

  const isValid = await bcrypt.compare(pin, user.pinHash);
  if (!isValid) throw new AppError("Invalid phone number or PIN", 401);

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
  const { code } = req.params;

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

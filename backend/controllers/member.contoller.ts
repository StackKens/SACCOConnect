import { Response } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../middleware/auth.middleware";
import { AppError } from "../middleware/error.middleware";
import { calculateEligibility } from "../services/eligibility.service";
import { paramString } from "../utils/helpers";
import { sendSMS } from "../services/sms.service";
import { assertSameSacco } from "../middleware/tenant.middleware";

export async function getSaccoMembers(req: AuthRequest, res: Response) {
  const member = await prisma.member.findUnique({
    where: { userId: req.user!.userId },
  });
  if (!member) throw new AppError("Member not found", 404);

  const members = await prisma.member.findMany({
    where: { saccoId: member.saccoId, status: "ACTIVE", NOT: { userId: req.user!.userId } },
    select: { id: true, fullName: true, user: { select: { phoneNumber: true } } },
    orderBy: { fullName: "asc" },
  });
  return res.json({ success: true, data: members });
}

export async function getMyProfile(req: AuthRequest, res: Response) {
  const member = await prisma.member.findUnique({
    where: { userId: req.user!.userId },
    include: { streak: true, sacco: true },
  });
  if (!member) throw new AppError("Member not found", 404);
  return res.json({ success: true, data: member });
}

export async function updateMyProfile(req: AuthRequest, res: Response) {
  const { fullName, nationalId, photoUrl } = req.body;
  const member = await prisma.member.findUnique({
    where: { userId: req.user!.userId },
  });
  if (!member) throw new AppError("Member not found", 404);

  const updated = await prisma.member.update({
    where: { id: member.id },
    data: { fullName, nationalId, photoUrl },
  });
  return res.json({ success: true, data: updated });
}

export async function getMyEligibility(req: AuthRequest, res: Response) {
  const member = await prisma.member.findUnique({
    where: { userId: req.user!.userId },
  });
  if (!member) throw new AppError("Member not found", 404);

  const eligibility = await calculateEligibility(member.id);
  return res.json({ success: true, data: eligibility });
}

export async function getAllMembers(req: AuthRequest, res: Response) {
  const saccoId = req.user!.saccoId;
  if (!saccoId) throw new AppError("No SACCO assigned", 400);

  const members = await prisma.member.findMany({
    where: { saccoId },
    include: {
      streak: true,
      user: { select: { phoneNumber: true, role: true } },
    },
    orderBy: { fullName: "asc" },
  });
  return res.json({ success: true, data: members });
}

export async function getMembersExport(req: AuthRequest, res: Response) {
  const saccoId = req.user!.saccoId;
  if (!saccoId) throw new AppError("No SACCO assigned", 400);

  const members = await prisma.member.findMany({
    where: { saccoId },
    include: {
      user: { select: { phoneNumber: true } },
      contributions: { orderBy: { createdAt: "asc" } },
      loans: true,
    },
    orderBy: { fullName: "asc" },
  });

  const memberRows = members.map((m) => {
    const savings = m.contributions
      .filter((c) => c.status === "CONFIRMED")
      .reduce((sum, c) => sum + c.amount, 0);
    const activeLoan = m.loans
      .filter((l) => l.status === "ACTIVE")
      .reduce(
        (sum, l) =>
          sum + (l.amountApproved ?? l.amountRequested) - l.amountRepaid,
        0,
      );
    return {
      id: m.id,
      name: m.fullName,
      phone: m.user?.phoneNumber ?? "",
      nationalId: m.nationalId ?? "",
      savings,
      activeLoan,
    };
  });

  const contributionRows = members.flatMap((m) =>
    m.contributions.map((c) => ({
      memberName: m.fullName,
      amount: c.amount,
      date: c.createdAt.toISOString().split("T")[0],
      status: c.status,
      method: c.method,
    })),
  );

  const loanRows = members.flatMap((m) =>
    m.loans.map((l) => ({
      memberName: m.fullName,
      amount: l.amountApproved ?? l.amountRequested,
      status: l.status,
      purpose: l.purpose,
      date: l.createdAt.toISOString().split("T")[0],
    })),
  );

  return res.json({
    success: true,
    data: { members: memberRows, contributions: contributionRows, loans: loanRows },
  });
}

export async function getMemberById(req: AuthRequest, res: Response) {
  const id = paramString(req.params, "id");
  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      streak: true,
      user: { select: { phoneNumber: true, role: true } },
      contributions: { orderBy: { createdAt: "desc" }, take: 10 },
      loans: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!member) throw new AppError("Member not found", 404);
  assertSameSacco(member.saccoId, req.user!.saccoId);
  return res.json({ success: true, data: member });
}

export async function updateMemberStatus(req: AuthRequest, res: Response) {
  const id = paramString(req.params, "id");
  const { status } = req.body;

  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) throw new AppError("Member not found", 404);
  assertSameSacco(member.saccoId, req.user!.saccoId);

  const updated = await prisma.member.update({
    where: { id },
    data: { status },
  });
  return res.json({ success: true, data: updated });
}

export async function deleteMember(req: AuthRequest, res: Response) {
  const id = paramString(req.params, "id");
  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) throw new AppError("Member not found", 404);
  assertSameSacco(member.saccoId, req.user!.saccoId);
  await prisma.user.delete({ where: { id: member.userId } });
  return res.json({ success: true, message: "Member deleted" });
}

export async function generateInviteLink(req: AuthRequest, res: Response) {
  const saccoId = req.user!.saccoId;
  if (!saccoId) throw new AppError("No SACCO assigned", 400);

  const sacco = await prisma.sacco.findUnique({
    where: { id: saccoId },
    select: { inviteCode: true, name: true },
  });
  if (!sacco) throw new AppError("SACCO not found", 404);

  return res.json({
    success: true,
    data: {
      inviteCode: sacco.inviteCode,
      saccoName: sacco.name,
      message: `Join ${sacco.name} SACCO on SACCOConnect. Use invite code: ${sacco.inviteCode}`,
    },
  });
}

export async function sendInviteSms(req: AuthRequest, res: Response) {
  const saccoId = req.user!.saccoId;
  if (!saccoId) throw new AppError("No SACCO assigned", 400);

  const { phoneNumber } = req.body;
  if (!phoneNumber) throw new AppError("Phone number is required", 400);

  const sacco = await prisma.sacco.findUnique({
    where: { id: saccoId },
    select: { inviteCode: true, name: true },
  });
  if (!sacco) throw new AppError("SACCO not found", 404);

  await sendSMS(
    phoneNumber,
    `You have been invited to join ${sacco.name} on SACCOConnect. Use invite code: ${sacco.inviteCode} to register in the app.`,
  );

  return res.json({
    success: true,
    data: {
      inviteCode: sacco.inviteCode,
      saccoName: sacco.name,
    },
  });
}

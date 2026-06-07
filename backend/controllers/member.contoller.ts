import { Response } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../middleware/auth.middleware";
import { AppError } from "../middleware/error.middleware";
import { calculateEligibility } from "../services/eligibility.service";

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

export async function getMemberById(req: AuthRequest, res: Response) {
  const { id } = req.params;
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
  return res.json({ success: true, data: member });
}

export async function updateMemberStatus(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { status } = req.body;

  const member = await prisma.member.update({
    where: { id },
    data: { status },
  });
  return res.json({ success: true, data: member });
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

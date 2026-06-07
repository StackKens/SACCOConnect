import { Response } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../middleware/auth.middleware";
import { AppError } from "../middleware/error.middleware";
import { contributionSchema } from "../utils/validators";
import { updateStreak } from "../services/streak.service";
import { notifyContributionConfirmed } from "../services/notification.service";

export async function submitContribution(req: AuthRequest, res: Response) {
  const data = contributionSchema.parse(req.body);
  const member = await prisma.member.findUnique({
    where: { userId: req.user!.userId },
  });
  if (!member) throw new AppError("Member not found", 404);
  if (member.status !== "ACTIVE")
    throw new AppError("Your account is not active", 403);

  const contribution = await prisma.contribution.create({
    data: {
      memberId: member.id,
      amount: data.amount,
      method: data.method,
      transactionRef: data.transactionRef,
      recordedBy: req.user!.userId,
      notes: data.notes,
      status: data.method === "CASH" ? "PENDING" : "CONFIRMED",
    },
  });

  if (contribution.status === "CONFIRMED") {
    await prisma.member.update({
      where: { id: member.id },
      data: { currentBalance: { increment: data.amount } },
    });
    await updateStreak(member.id);
    await notifyContributionConfirmed(
      req.user!.userId,
      data.amount,
      contribution.id,
    );
  }

  return res.status(201).json({ success: true, data: contribution });
}

export async function getMyContributions(req: AuthRequest, res: Response) {
  const member = await prisma.member.findUnique({
    where: { userId: req.user!.userId },
  });
  if (!member) throw new AppError("Member not found", 404);

  const contributions = await prisma.contribution.findMany({
    where: { memberId: member.id },
    orderBy: { createdAt: "desc" },
  });
  return res.json({ success: true, data: contributions });
}

export async function getAllContributions(req: AuthRequest, res: Response) {
  const saccoId = req.user!.saccoId;
  if (!saccoId) throw new AppError("No SACCO assigned", 400);

  const contributions = await prisma.contribution.findMany({
    where: { member: { saccoId } },
    include: { member: { select: { fullName: true, id: true } } },
    orderBy: { createdAt: "desc" },
  });
  return res.json({ success: true, data: contributions });
}

export async function recordCashPayment(req: AuthRequest, res: Response) {
  const data = contributionSchema.parse(req.body);
  const { memberId } = req.body;

  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) throw new AppError("Member not found", 404);

  const contribution = await prisma.contribution.create({
    data: {
      memberId,
      amount: data.amount,
      method: "CASH",
      recordedBy: req.user!.userId,
      notes: data.notes,
      status: "CONFIRMED",
    },
  });

  await prisma.member.update({
    where: { id: memberId },
    data: { currentBalance: { increment: data.amount } },
  });
  await updateStreak(memberId);
  await notifyContributionConfirmed(
    member.userId,
    data.amount,
    contribution.id,
  );

  return res.status(201).json({ success: true, data: contribution });
}

export async function confirmContribution(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const contribution = await prisma.contribution.findUnique({ where: { id } });
  if (!contribution) throw new AppError("Contribution not found", 404);
  if (contribution.status !== "PENDING")
    throw new AppError("Contribution already processed", 400);

  const updated = await prisma.contribution.update({
    where: { id },
    data: { status: "CONFIRMED" },
  });

  await prisma.member.update({
    where: { id: contribution.memberId },
    data: { currentBalance: { increment: contribution.amount } },
  });
  await updateStreak(contribution.memberId);

  const member = await prisma.member.findUnique({
    where: { id: contribution.memberId },
  });
  if (member) {
    await notifyContributionConfirmed(
      member.userId,
      contribution.amount,
      contribution.id,
    );
  }

  return res.json({ success: true, data: updated });
}

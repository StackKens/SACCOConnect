import { Response } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../middleware/auth.middleware";
import { AppError } from "../middleware/error.middleware";
import { contributionSchema } from "../utils/validators";
import { updateStreak } from "../services/streak.service";
import { notifyContributionConfirmed } from "../services/notification.service";
import { paramString } from "../utils/helpers";
import { assertSameSacco } from "../middleware/tenant.middleware";
import { sendEvent, transactionEvent } from "../services/security-intelligence.service";
function eventContext(req: AuthRequest) {
  return {
    channel: "mobile_app" as const,
    ipAddress: req.ip || undefined,
    deviceId: req.headers["x-device-id"] as string | undefined,
  };
}

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
    try { await notifyContributionConfirmed(req.user!.userId, data.amount, contribution.id); } catch {}
  }

  void sendEvent(
    transactionEvent(req.user!.userId, "contribution", data.amount, eventContext(req)),
  );

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

export async function getTreasuryStats(req: AuthRequest, res: Response) {
  const saccoId = req.user!.saccoId;
  if (!saccoId) throw new AppError("No SACCO assigned", 400);

  const [members, contributions, loans, repayments] = await Promise.all([
    prisma.member.findMany({ where: { saccoId } }),
    prisma.contribution.findMany({
      where: { member: { saccoId }, status: "CONFIRMED" },
      include: { member: { select: { fullName: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.loan.findMany({
      where: { member: { saccoId } },
    }),
    prisma.loanRepayment.findMany({
      where: { loan: { member: { saccoId } } },
      include: { loan: { include: { member: { select: { fullName: true } } } } },
      orderBy: { paymentDate: "desc" },
    }),
  ]);

  const totalSavings = members.reduce((sum, m) => sum + m.currentBalance, 0);

  const activeLoans = loans.filter((l) => l.status === "ACTIVE");
  const totalDisbursed = activeLoans.reduce((sum, l) => sum + (l.amountApproved ?? 0), 0);
  const totalRepaid = activeLoans.reduce((sum, l) => sum + l.amountRepaid, 0);
  const outstanding = Math.max(totalDisbursed - totalRepaid, 0);
  const collectionRate = totalDisbursed ? Math.round((totalRepaid / totalDisbursed) * 100) : 0;

  // monthly chart data — last 6 months
  const monthMap = new Map<string, { collections: number; disbursed: number }>();
  for (const c of contributions) {
    const month = c.createdAt.toISOString().slice(0, 7);
    const entry = monthMap.get(month) ?? { collections: 0, disbursed: 0 };
    entry.collections += c.amount;
    monthMap.set(month, entry);
  }
  for (const l of activeLoans) {
    if (!l.disbursementDate) continue;
    const month = l.disbursementDate.toISOString().slice(0, 7);
    const entry = monthMap.get(month) ?? { collections: 0, disbursed: 0 };
    entry.disbursed += l.amountApproved ?? 0;
    monthMap.set(month, entry);
  }
  const monthlyData = [...monthMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, val]) => ({ month: key, ...val }));

  // recent transactions — latest 6 across contributions + repayments
  const recentContributions = contributions.slice(0, 6).map((c) => ({
    id: c.id,
    member: c.member.fullName,
    type: "contribution",
    amount: c.amount,
    date: c.createdAt.toISOString(),
  }));
  const recentRepayments = repayments.slice(0, 6).map((r) => ({
    id: r.id,
    member: r.loan.member.fullName,
    type: "loan repayment",
    amount: -r.amountPaid,
    date: r.paymentDate.toISOString(),
  }));
  const recentTransactions = [...recentContributions, ...recentRepayments]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  return res.json({
    success: true,
    data: {
      totalSavings,
      totalDisbursed,
      totalRepaid,
      outstanding,
      collectionRate,
      monthlyData,
      recentTransactions,
    },
  });
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
  assertSameSacco(member.saccoId, req.user!.saccoId);

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
  const id = paramString(req.params, "id");

  const contribution = await prisma.contribution.findUnique({
    where: { id },
    include: { member: { select: { saccoId: true } } },
  });
  if (!contribution) throw new AppError("Contribution not found", 404);
  assertSameSacco(contribution.member.saccoId, req.user!.saccoId);
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

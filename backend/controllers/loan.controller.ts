import { Response } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../middleware/auth.middleware";
import { AppError } from "../middleware/error.middleware";
import {
  loanApplicationSchema,
  loanApprovalSchema,
  loanRejectionSchema,
  repaymentSchema,
} from "../utils/validators";
import {
  calculateEligibility,
  calculateRepaymentSchedule,
} from "../services/eligibility.service";
import {
  notifyGuarantorRequest,
  notifyLoanApproved,
  notifyLoanRejected,
  scheduleRepaymentReminders,
} from "../services/notification.service";
import { paramString } from "../utils/helpers";

export async function applyForLoan(req: AuthRequest, res: Response) {
  const data = loanApplicationSchema.parse(req.body);
  const member = await prisma.member.findUnique({
    where: { userId: req.user!.userId },
  });
  if (!member) throw new AppError("Member not found", 404);

  const eligibility = await calculateEligibility(member.id);
  if (eligibility.hasActiveLoan)
    throw new AppError(eligibility.reason || "You have an active loan", 400);
  if (data.amountRequested > eligibility.maxAmount) {
    throw new AppError(
      `Maximum loan amount is UGX ${eligibility.maxAmount.toLocaleString()}`,
      400,
    );
  }

  const sacco = await prisma.sacco.findUnique({
    where: { id: member.saccoId },
  });
  if (!sacco) throw new AppError("SACCO not found", 404);

  const schedule = calculateRepaymentSchedule(
    data.amountRequested,
    sacco.interestRate,
    data.repaymentMonths,
  );

  const guarantorMembers = await prisma.member.findMany({
    where: {
      id: { in: data.guarantorIds },
      status: "ACTIVE",
      saccoId: member.saccoId,
    },
  });
  if (guarantorMembers.length !== 2)
    throw new AppError("Both guarantors must be active SACCO members", 400);

  const loan = await prisma.$transaction(async (tx) => {
    const newLoan = await tx.loan.create({
      data: {
        memberId: member.id,
        amountRequested: data.amountRequested,
        purpose: data.purpose,
        status: "AWAITING_GUARANTORS",
        interestRate: sacco.interestRate,
        repaymentMonths: data.repaymentMonths,
        totalRepayable: schedule.totalRepayable,
      },
    });

    await Promise.all(
      data.guarantorIds.map((gId) =>
        tx.guarantor.create({
          data: { loanId: newLoan.id, guarantorMemberId: gId },
        }),
      ),
    );

    return newLoan;
  });

  // notify guarantors — never crash application if SMS fails
  try {
    await Promise.all(
      guarantorMembers.map((g) =>
        notifyGuarantorRequest(g.userId, member.fullName, loan.id, data.amountRequested),
      ),
    );
  } catch {}

  return res
    .status(201)
    .json({ success: true, data: { loan, repaymentSchedule: schedule } });
}

export async function getMyLoans(req: AuthRequest, res: Response) {
  const member = await prisma.member.findUnique({
    where: { userId: req.user!.userId },
  });
  if (!member) throw new AppError("Member not found", 404);

  const loans = await prisma.loan.findMany({
    where: { memberId: member.id },
    include: { guarantors: { include: { guarantor: true } }, repayments: true },
    orderBy: { createdAt: "desc" },
  });
  return res.json({ success: true, data: loans });
}

export async function getMyActiveLoan(req: AuthRequest, res: Response) {
  const member = await prisma.member.findUnique({
    where: { userId: req.user!.userId },
  });
  if (!member) throw new AppError("Member not found", 404);

  const loan = await prisma.loan.findFirst({
    where: { memberId: member.id, status: "ACTIVE" },
    include: { repayments: { orderBy: { paymentDate: "desc" } } },
  });
  return res.json({ success: true, data: loan });
}

export async function getLoanQueue(req: AuthRequest, res: Response) {
  const saccoId = req.user!.saccoId;
  if (!saccoId) throw new AppError("No SACCO assigned", 400);

  const loans = await prisma.loan.findMany({
    where: {
      member: { saccoId },
      status: { in: ["PENDING", "AWAITING_GUARANTORS", "UNDER_REVIEW"] },
    },
    include: {
      member: true,
      guarantors: { include: { guarantor: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  return res.json({ success: true, data: loans });
}

export async function getLoanById(req: AuthRequest, res: Response) {
  const id = paramString(req.params, "id");
  const loan = await prisma.loan.findUnique({
    where: { id },
    include: {
      member: true,
      guarantors: { include: { guarantor: true } },
      repayments: { orderBy: { paymentDate: "desc" } },
    },
  });
  if (!loan) throw new AppError("Loan not found", 404);
  return res.json({ success: true, data: loan });
}

export async function approveLoan(req: AuthRequest, res: Response) {
  const id = paramString(req.params, "id");
  const data = loanApprovalSchema.parse(req.body);

  const loan = await prisma.loan.findUnique({
    where: { id },
    include: { member: true },
  });
  if (!loan) throw new AppError("Loan not found", 404);
  if (
    !["UNDER_REVIEW", "AWAITING_GUARANTORS", "PENDING"].includes(loan.status)
  ) {
    throw new AppError("Loan cannot be approved at this stage", 400);
  }

  const sacco = await prisma.sacco.findUnique({
    where: { id: loan.member.saccoId },
  });
  if (!sacco) throw new AppError("SACCO not found", 404);

  const schedule = calculateRepaymentSchedule(
    data.amountApproved,
    sacco.interestRate,
    data.repaymentMonths,
  );
  const disbursementDate = new Date();
  const expectedCompletion = new Date();
  expectedCompletion.setMonth(
    expectedCompletion.getMonth() + data.repaymentMonths,
  );

  const updated = await prisma.loan.update({
    where: { id },
    data: {
      status: "ACTIVE",
      amountApproved: data.amountApproved,
      repaymentMonths: data.repaymentMonths,
      totalRepayable: schedule.totalRepayable,
      disbursementDate,
      expectedCompletion,
      reviewedBy: req.user!.userId,
    },
  });

  // notify member — never crash approval if SMS fails
  try { await notifyLoanApproved(loan.member.userId, data.amountApproved, id); } catch {}

  // schedule weekly repayment reminders (7 × repaymentMonths reminders)
  scheduleRepaymentReminders(loan.member.userId, loan.member.fullName, data.amountApproved, data.repaymentMonths, expectedCompletion);

  return res.json({
    success: true,
    data: updated,
    message: `Loan of UGX ${data.amountApproved.toLocaleString()} approved for ${loan.member.fullName}. Repayment due by ${expectedCompletion.toDateString()}.`,
  });
}

export async function rejectLoan(req: AuthRequest, res: Response) {
  const id = paramString(req.params, "id");
  const data = loanRejectionSchema.parse(req.body);

  const loan = await prisma.loan.findUnique({
    where: { id },
    include: { member: true },
  });
  if (!loan) throw new AppError("Loan not found", 404);

  const updated = await prisma.loan.update({
    where: { id },
    data: {
      status: "REJECTED",
      rejectionReason: data.reason,
      reviewedBy: req.user!.userId,
    },
  });

  try { await notifyLoanRejected(loan.member.userId, data.reason, id); } catch {}

  return res.json({ success: true, data: updated });
}

export async function makeRepayment(req: AuthRequest, res: Response) {
  const id = paramString(req.params, "id");
  const data = repaymentSchema.parse(req.body);

  const loan = await prisma.loan.findUnique({
    where: { id },
    include: { member: true },
  });
  if (!loan) throw new AppError("Loan not found", 404);
  if (loan.status !== "ACTIVE") throw new AppError("Loan is not active", 400);

  const member = await prisma.member.findUnique({
    where: { userId: req.user!.userId },
  });
  if (!member || loan.memberId !== member.id)
    throw new AppError("Unauthorized", 403);

  const repayment = await prisma.loanRepayment.create({
    data: {
      loanId: id,
      amountPaid: data.amountPaid,
      method: data.method,
      transactionRef: data.transactionRef,
    },
  });

  const newAmountRepaid = loan.amountRepaid + data.amountPaid;
  const isFullyRepaid = newAmountRepaid >= (loan.totalRepayable || 0);

  await prisma.loan.update({
    where: { id },
    data: {
      amountRepaid: newAmountRepaid,
      status: isFullyRepaid ? "REPAID" : "ACTIVE",
    },
  });

  return res.json({
    success: true,
    data: repayment,
    fullyRepaid: isFullyRepaid,
  });
}

export async function getActiveLoans(req: AuthRequest, res: Response) {
  const saccoId = req.user!.saccoId;
  if (!saccoId) throw new AppError("No SACCO assigned", 400);

  const loans = await prisma.loan.findMany({
    where: { member: { saccoId }, status: "ACTIVE" },
    include: { member: true, repayments: { orderBy: { paymentDate: "desc" } } },
    orderBy: { disbursementDate: "asc" },
  });
  return res.json({ success: true, data: loans });
}

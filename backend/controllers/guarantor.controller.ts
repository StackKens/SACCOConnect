import { Response } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../middleware/auth.middleware";
import { AppError } from "../middleware/error.middleware";
import { paramString } from "../utils/helpers";

export async function getMyGuarantorRequests(req: AuthRequest, res: Response) {
  const member = await prisma.member.findUnique({
    where: { userId: req.user!.userId },
  });
  if (!member) throw new AppError("Member not found", 404);

  const requests = await prisma.guarantor.findMany({
    where: { guarantorMemberId: member.id, status: "PENDING" },
    include: {
      loan: { include: { member: true } },
    },
  });
  return res.json({ success: true, data: requests });
}

export async function respondToGuarantorRequest(
  req: AuthRequest,
  res: Response,
) {
  const id = paramString(req.params, "id");
  const { action } = req.body;

  if (!["ACCEPTED", "DECLINED"].includes(action)) {
    throw new AppError("Action must be ACCEPTED or DECLINED", 400);
  }

  const member = await prisma.member.findUnique({
    where: { userId: req.user!.userId },
  });
  if (!member) throw new AppError("Member not found", 404);

  const guarantor = await prisma.guarantor.findUnique({
    where: { id },
    include: { loan: true },
  });

  if (!guarantor) throw new AppError("Guarantor request not found", 404);
  if (guarantor.guarantorMemberId !== member.id)
    throw new AppError("Unauthorized", 403);
  if (guarantor.status !== "PENDING")
    throw new AppError("Request already responded to", 400);

  const updated = await prisma.guarantor.update({
    where: { id },
    data: { status: action, responseDate: new Date() },
  });

  if (action === "ACCEPTED") {
    const allGuarantors = await prisma.guarantor.findMany({
      where: { loanId: guarantor.loanId },
    });
    const allAccepted = allGuarantors.every(
      (g) => g.id === id || g.status === "ACCEPTED",
    );
    if (allAccepted) {
      await prisma.loan.update({
        where: { id: guarantor.loanId },
        data: { status: "UNDER_REVIEW" },
      });
    }
  }

  if (action === "DECLINED") {
    await prisma.loan.update({
      where: { id: guarantor.loanId },
      data: {
        status: "REJECTED",
        rejectionReason: "A guarantor declined the request",
      },
    });
  }

  return res.json({ success: true, data: updated });
}

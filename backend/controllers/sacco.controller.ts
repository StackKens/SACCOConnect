import { Response } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../middleware/auth.middleware";
import { AppError } from "../middleware/error.middleware";
import { assertSameSacco } from "../middleware/tenant.middleware";
import {
  paymentAccountSchema,
  paymentAccountUpdateSchema,
} from "../utils/validators";
import { paramString } from "../utils/helpers";

export async function getMySacco(req: AuthRequest, res: Response) {
  const saccoId = req.user!.saccoId;
  if (!saccoId) throw new AppError("No SACCO assigned", 403);

  const sacco = await prisma.sacco.findUnique({
    where: { id: saccoId },
    include: { paymentAccounts: { orderBy: { createdAt: "asc" } } },
  });
  if (!sacco) throw new AppError("SACCO not found", 404);

  const isAdmin = req.user!.role === "ADMIN";
  const paymentAccounts = isAdmin
    ? sacco.paymentAccounts
    : sacco.paymentAccounts.filter((a) => a.isActive && a.isMemberVisible);

  return res.json({
    success: true,
    data: { ...sacco, paymentAccounts },
  });
}

export async function addPaymentAccount(req: AuthRequest, res: Response) {
  const saccoId = req.user!.saccoId;
  if (!saccoId) throw new AppError("No SACCO assigned", 403);
  const data = paymentAccountSchema.parse(req.body);

  const account = await prisma.paymentAccount.create({
    data: {
      saccoId,
      type: data.type,
      accountNumber: data.accountNumber,
      accountName: data.accountName,
      provider: data.provider,
    },
  });

  return res.status(201).json({ success: true, data: account });
}

export async function updatePaymentAccount(req: AuthRequest, res: Response) {
  const saccoId = req.user!.saccoId;
  if (!saccoId) throw new AppError("No SACCO assigned", 403);
  const id = paramString(req.params, "id");
  const data = paymentAccountUpdateSchema.parse(req.body);

  const existing = await prisma.paymentAccount.findUnique({ where: { id } });
  if (!existing) throw new AppError("Payment account not found", 404);
  assertSameSacco(existing.saccoId, saccoId);

  const updated = await prisma.paymentAccount.update({
    where: { id },
    data: {
      type: data.type,
      accountNumber: data.accountNumber,
      accountName: data.accountName,
      provider: data.provider === undefined ? undefined : data.provider,
      isActive: data.isActive,
      isMemberVisible: data.isMemberVisible,
    },
  });

  return res.json({ success: true, data: updated });
}

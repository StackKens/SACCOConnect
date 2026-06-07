import { prisma } from "../config/database";
import { sendSMS } from "./sms.service";

async function getPhone(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { phoneNumber: true },
  });
  return user?.phoneNumber ?? null;
}

export async function notifyGuarantorRequest(
  userId: string,
  memberName: string,
  _loanId: string,
  amount: number,
): Promise<void> {
  const phone = await getPhone(userId);
  if (!phone) return;
  await sendSMS(
    phone,
    `SACCOConnect: ${memberName} has requested you as a guarantor for a loan of UGX ${amount.toLocaleString()}. Open the app to respond.`,
  );
}

export async function notifyLoanApproved(
  userId: string,
  amount: number,
  _loanId: string,
): Promise<void> {
  const phone = await getPhone(userId);
  if (!phone) return;
  await sendSMS(
    phone,
    `SACCOConnect: Congratulations! Your loan of UGX ${amount.toLocaleString()} has been approved and will be disbursed shortly.`,
  );
}

export async function notifyLoanRejected(
  userId: string,
  reason: string,
  _loanId: string,
): Promise<void> {
  const phone = await getPhone(userId);
  if (!phone) return;
  await sendSMS(
    phone,
    `SACCOConnect: Your loan application was not approved. Reason: ${reason}. Contact your SACCO admin for more details.`,
  );
}

export async function notifyContributionConfirmed(
  userId: string,
  amount: number,
  _contributionId: string,
): Promise<void> {
  const phone = await getPhone(userId);
  if (!phone) return;
  await sendSMS(
    phone,
    `SACCOConnect: Your contribution of UGX ${amount.toLocaleString()} has been confirmed. Thank you for saving!`,
  );
}

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

// Schedules weekly SMS reminders for loan repayment using setTimeout chains.
// In production replace with a proper job queue (e.g. BullMQ).
export function scheduleRepaymentReminders(
  userId: string,
  memberName: string,
  amount: number,
  repaymentMonths: number,
  expectedCompletion: Date,
): void {
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const totalWeeks = repaymentMonths * 4;
  const monthlyInstalment = Math.ceil(amount / repaymentMonths);

  for (let week = 1; week <= totalWeeks; week++) {
    const delay = week * WEEK_MS;
    const fireDate = new Date(Date.now() + delay);
    if (fireDate > expectedCompletion) break;

    setTimeout(async () => {
      try {
        const phone = await getPhone(userId);
        if (!phone) return;
        await sendSMS(
          phone,
          `SACCOConnect Reminder: Hi ${memberName}, your loan repayment of UGX ${monthlyInstalment.toLocaleString()} is due. Please repay via the SACCOConnect app.`,
        );
      } catch {}
    }, delay);
  }
}

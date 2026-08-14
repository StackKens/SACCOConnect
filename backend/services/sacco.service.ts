import bcrypt from "bcryptjs";
import { prisma } from "../config/database";
import { generateInviteCode } from "../utils/helpers";

export interface PaymentAccountInput {
  type: "BANK" | "MOBILE_MONEY";
  accountNumber: string;
  accountName: string;
  provider?: string;
}

export interface SaccoAdminInput {
  phoneNumber: string;
  pin: string;
  fullName: string;
  nationalId?: string;
  saccoName: string;
  registrationNo?: string;
  contributionAmount: number;
  maxLoanMultiplier: number;
  interestRate: number;
  loanTermMonths: number;
  meetingDay?: string;
  rulesText?: string;
  countryCode: string;
  termsAccepted: boolean;
  termsVersion: string;
  paymentAccount: PaymentAccountInput;
}

/**
 * Atomically provisions a new SACCO together with its first payment account,
 * the administrator user/member, and the admin's streak record.
 * The payment account belongs to the SACCO, never to the administrator.
 */
export async function createSaccoWithAdmin(input: SaccoAdminInput) {
  const pinHash = await bcrypt.hash(input.pin, 12);
  const inviteCode = generateInviteCode();

  return prisma.$transaction(async (tx) => {
    const sacco = await tx.sacco.create({
      data: {
        name: input.saccoName,
        registrationNo: input.registrationNo,
        contributionAmount: input.contributionAmount,
        maxLoanMultiplier: input.maxLoanMultiplier,
        interestRate: input.interestRate,
        loanTermMonths: input.loanTermMonths,
        meetingDay: input.meetingDay,
        rulesText: input.rulesText,
        inviteCode,
        countryCode: input.countryCode,
        termsAccepted: input.termsAccepted,
        termsVersion: input.termsVersion,
        termsAcceptedAt: input.termsAccepted ? new Date() : null,
        paymentAccounts: {
          create: {
            type: input.paymentAccount.type,
            accountNumber: input.paymentAccount.accountNumber,
            accountName: input.paymentAccount.accountName,
            provider: input.paymentAccount.provider,
          },
        },
      },
      include: { paymentAccounts: true },
    });

    const user = await tx.user.create({
      data: {
        phoneNumber: input.phoneNumber,
        pinHash,
        role: "ADMIN",
        saccoId: sacco.id,
      },
    });

    const member = await tx.member.create({
      data: {
        userId: user.id,
        saccoId: sacco.id,
        fullName: input.fullName,
        nationalId: input.nationalId,
      },
    });

    await tx.streak.create({
      data: { memberId: member.id, monthlyRecord: "{}" },
    });

    return { user, sacco, member };
  });
}

import { z } from "zod";

// Normalizes any Uganda phone format to 07XXXXXXXX
function normalizeUgandaPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("256")) return "0" + digits.slice(3);
  if (digits.startsWith("0")) return digits.slice(0, 10);
  return "0" + digits;
}

const phoneSchema = z
  .string()
  .min(9)
  .max(15)
  .transform(normalizeUgandaPhone);

export const sendOTPSchema = z.object({ phoneNumber: phoneSchema });
export const verifyOTPSchema = z.object({ phoneNumber: phoneSchema, code: z.string().length(6) });
export const loginSchema = z.object({ phoneNumber: phoneSchema, pin: z.string().length(4) });

export const registerAdminSchema = z.object({
  phoneNumber: phoneSchema,
  fullName: z.string().min(2).max(100),
  nationalId: z.string().optional(),
  pin: z.string().length(4),
  saccoName: z.string().min(2).max(100),
  registrationNo: z.string().optional(),
  contributionAmount: z.number().min(1000),
  maxLoanMultiplier: z.number().min(1).max(10),
  interestRate: z.number().min(1).max(100),
  loanTermMonths: z.number().min(1).max(60),
  meetingDay: z.string().optional(),
  rulesText: z.string().optional(),
});

export const registerMemberSchema = z.object({
  phoneNumber: phoneSchema,
  fullName: z.string().min(2).max(100),
  nationalId: z.string().optional(),
  pin: z.string().length(4),
  inviteCode: z.string().min(6).max(12),
});

export const contributionSchema = z.object({
  amount: z.number().min(1000),
  method: z.enum(["MOBILE_MONEY", "CASH", "BANK_TRANSFER"]),
  transactionRef: z.string().optional(),
  notes: z.string().optional(),
});

export const loanApplicationSchema = z.object({
  amountRequested: z.number().min(10000),
  purpose: z.string().min(5).max(500),
  repaymentMonths: z.number().min(1).max(60),
  guarantorIds: z.array(z.string()).length(2),
});

export const loanApprovalSchema = z.object({
  amountApproved: z.number().min(1000),
  repaymentMonths: z.number().min(1).max(60),
});

export const loanRejectionSchema = z.object({
  reason: z.string().min(5).max(500),
});

export const repaymentSchema = z.object({
  amountPaid: z.number().min(1000),
  method: z.enum(["MOBILE_MONEY", "CASH", "BANK_TRANSFER"]),
  transactionRef: z.string().optional(),
});

export const announcementSchema = z.object({
  title: z.string().min(2).max(100),
  message: z.string().min(5).max(1000),
});

export const saccoSettingsSchema = z.object({
  contributionAmount: z.number().min(1000).optional(),
  maxLoanMultiplier: z.number().min(1).max(10).optional(),
  interestRate: z.number().min(0.01).max(1).optional(),
  loanTermMonths: z.number().min(1).max(60).optional(),
  meetingDay: z.string().optional(),
  rulesText: z.string().optional(),
});

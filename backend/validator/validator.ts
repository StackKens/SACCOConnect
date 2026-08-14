import { z } from "zod";
import {
  isSupportedCountryCode,
  isValidCountryPhone,
  normalizeCountryPhone,
} from "./phone";

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
export const changePinSchema = z.object({
  currentPin: z.string().length(4),
  newPin: z.string().length(4),
});

export const accountTypeSchema = z.enum(["BANK", "MOBILE_MONEY"]);

export const paymentAccountSchema = z
  .object({
    type: accountTypeSchema,
    accountNumber: z.string().trim().min(1, "Account number is required"),
    accountName: z.string().trim().min(2, "Account name is required"),
    provider: z.string().trim().optional(),
  })
  .superRefine((acc, ctx) => {
    if (
      acc.type === "MOBILE_MONEY" &&
      acc.accountNumber.replace(/\D/g, "").length < 9
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["accountNumber"],
        message: "Enter a valid mobile money number",
      });
    }
    if (acc.type === "BANK" && acc.accountNumber.length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["accountNumber"],
        message: "Enter a valid bank account number",
      });
    }
  });

export const paymentAccountUpdateSchema = z
  .object({
    type: accountTypeSchema.optional(),
    accountNumber: z.string().trim().min(1).optional(),
    accountName: z.string().trim().min(2).optional(),
    provider: z.string().trim().nullable().optional(),
    isActive: z.boolean().optional(),
    isMemberVisible: z.boolean().optional(),
  })
  .superRefine((acc, ctx) => {
    if (
      acc.type === "MOBILE_MONEY" &&
      acc.accountNumber &&
      acc.accountNumber.replace(/\D/g, "").length < 9
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["accountNumber"],
        message: "Enter a valid mobile money number",
      });
    }
    if (acc.type === "BANK" && acc.accountNumber && acc.accountNumber.length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["accountNumber"],
        message: "Enter a valid bank account number",
      });
    }
  });

export const registerAdminSchema = z
  .object({
    countryCode: z
      .string()
      .refine(isSupportedCountryCode, "Unsupported country code"),
    phoneNumber: z.string().min(9, "Enter a valid phone number"),
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
    termsAccepted: z.boolean().refine((v) => v === true, {
      message: "Terms and conditions must be accepted",
    }),
    termsVersion: z.string().min(1),
    paymentAccount: paymentAccountSchema,
  })
  .superRefine((data, ctx) => {
    if (!isValidCountryPhone(data.phoneNumber, data.countryCode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phoneNumber"],
        message: "Enter a valid phone number for the selected country",
      });
    }
  })
  .transform((data) => ({
    ...data,
    phoneNumber: normalizeCountryPhone(data.phoneNumber, data.countryCode),
  }));

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

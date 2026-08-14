import axios from "axios";
import { api } from "./api";
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  getRefreshToken,
  setRefreshToken,
  clearRefreshToken,
} from "./tokenStorage";

export {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  getRefreshToken,
  setRefreshToken,
  clearRefreshToken,
};

export interface AuthSessionResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; role: string; phoneNumber: string };
  member?: { id: string; fullName: string; nationalId?: string | null };
  sacco?: {
    id: string;
    name: string;
    contributionAmount: number;
    interestRate: number;
    loanTermMonths?: number;
    meetingDay?: string | null;
    rulesText?: string | null;
    inviteCode?: string;
    maxLoanMultiplier?: number;
    registrationNo?: string | null;
    countryCode?: string;
    termsAccepted?: boolean;
    termsVersion?: string;
    paymentAccounts?: PaymentAccount[];
  };
}

export interface PaymentAccount {
  id: string;
  type: "BANK" | "MOBILE_MONEY";
  accountNumber: string;
  accountName: string;
  provider?: string | null;
  isActive: boolean;
  isMemberVisible: boolean;
  createdAt?: string;
}

export interface PaymentAccountInput {
  type: "BANK" | "MOBILE_MONEY";
  accountNumber: string;
  accountName: string;
  provider?: string;
}

export interface InvitePreviewResponse {
  id: string;
  name: string;
  contributionAmount: number;
  interestRate: number;
  loanTermMonths?: number;
  meetingDay?: string | null;
  inviteCode: string;
  adminName: string;
  memberCount?: number;
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
    if (!error.response) {
      return "Oops, we are sorry,we are unable to send you the code. Please try again later";
    }
    return error.message;
  }
  return error instanceof Error ? error.message : "Something went wrong";
}

export const authApi = {
  requestOtp: (phoneNumber: string) =>
    api.post<{ success: boolean; message: string; dev_otp?: string }>(
      "/api/auth/otp/request",
      { phoneNumber },
    ),

  verifyOtp: (phoneNumber: string, code: string) =>
    api.post<{ success: boolean; message: string }>("/api/auth/otp/verify", {
      phoneNumber,
      code,
    }),

  login: (phoneNumber: string, pin: string) =>
    api.post<{ success: boolean; data: AuthSessionResponse }>(
      "/api/auth/login",
      {
        phoneNumber,
        pin,
      },
    ),

  registerAdmin: (payload: {
    phoneNumber: string;
    fullName: string;
    nationalId?: string;
    pin: string;
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
  }) =>
    api.post<{ success: boolean; data: AuthSessionResponse }>(
      "/api/auth/register/admin",
      payload,
    ),

  registerMember: (payload: {
    phoneNumber: string;
    fullName: string;
    nationalId?: string;
    pin: string;
    inviteCode: string;
  }) =>
    api.post<{ success: boolean; data: AuthSessionResponse }>(
      "/api/auth/register/member",
      payload,
    ),

  validateInvite: (code: string) =>
    api.get<{ success: boolean; data: InvitePreviewResponse }>(
      `/api/auth/invite/${encodeURIComponent(code.trim().toUpperCase())}`,
    ),

  refresh: (refreshToken: string) =>
    api.post<{ success: boolean; data: { accessToken: string } }>(
      "/api/auth/refresh",
      { token: refreshToken },
    ),

  logout: (refreshToken: string) =>
    api.post<{ success: boolean; message: string }>("/api/auth/logout", {
      token: refreshToken,
    }),
};

export const saccoApi = {
  getMySacco: () =>
    api.get<{ success: boolean; data: { paymentAccounts: PaymentAccount[] } & Record<string, unknown> }>(
      "/api/saccos/me",
    ),

  addPaymentAccount: (payload: PaymentAccountInput) =>
    api.post<{ success: boolean; data: PaymentAccount }>(
      "/api/saccos/payment-accounts",
      payload,
    ),

  updatePaymentAccount: (
    id: string,
    payload: Partial<PaymentAccountInput> & {
      isActive?: boolean;
      isMemberVisible?: boolean;
    },
  ) =>
    api.patch<{ success: boolean; data: PaymentAccount }>(
      `/api/saccos/payment-accounts/${encodeURIComponent(id)}`,
      payload,
    ),
};

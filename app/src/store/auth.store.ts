import { create } from "zustand";
import { MMKV } from "react-native-mmkv";
import { User, SACCO, InviteCode } from "../types";
import { useMemberDataStore } from "./member.store";
import { useLoanStore } from "./loan.store";
import { useAnnouncementStore } from "./announcement.store";
import { defaultContributionDueDate } from "../utils/date";
import {
  authApi,
  AuthSessionResponse,
  clearAccessToken,
  getApiErrorMessage,
  setAccessToken,
} from "../services/auth.service";
import { mockLogin } from "../services/mockAuth";
import { api } from "../services/api";
import { Contribution, MemberLoan, Transaction } from "./member.store";

const storage = new MMKV({ id: "auth" });

function mapSacco(raw: AuthSessionResponse["sacco"]): SACCO | null {
  if (!raw) return null;
  const rules = raw.rulesText
    ? raw.rulesText.split("\n").map((r) => r.trim()).filter(Boolean)
    : [];
  return {
    id: raw.id,
    name: raw.name,
    contributionAmount: raw.contributionAmount,
    interestRate: raw.interestRate,
    contributionDueDate: defaultContributionDueDate(5),
    rules,
    adminId: "",
    logoColor: "#3B82F6",
    inviteCode: raw.inviteCode,
  };
}

function mapUser(data: AuthSessionResponse): User {
  const role = data.user.role === "ADMIN" ? "admin" : "member";
  return {
    id: data.user.id,
    name: data.member?.fullName ?? "",
    phone: data.user.phoneNumber,
    role,
    saccoId: data.sacco?.id,
    saccoName: data.sacco?.name,
    nationalId: data.member?.nationalId ?? undefined,
  };
}

function persistSession(data: AuthSessionResponse) {
  const user = mapUser(data);
  const sacco = mapSacco(data.sacco);
  setAccessToken(data.accessToken);
  storage.set("user", JSON.stringify(user));
  if (sacco) storage.set("sacco", JSON.stringify(sacco));
  return { user, sacco };
}

async function syncMemberData(userId: string) {
  try {
    const [contribRes, loanRes] = await Promise.all([
      api.get("/api/contributions/my"),
      api.get("/api/loans/my"),
    ]);

    const rawContributions = contribRes.data.data ?? [];
    const rawLoans = loanRes.data.data ?? [];

    const contributions: Contribution[] = rawContributions.map((c: any) => ({
      id: c.id,
      amount: c.amount,
      date: c.createdAt?.split("T")[0] ?? c.date ?? "",
      status: c.status === "CONFIRMED" ? "completed" : "pending",
      method: c.method?.replace("_", " ") ?? "Unknown",
    }));

    const loans: MemberLoan[] = rawLoans.map((l: any) => ({
      id: l.id,
      amount: l.amountApproved ?? l.amountRequested,
      repaid: l.amountRepaid ?? 0,
      status: l.status === "ACTIVE" ? "active"
        : l.status === "REPAID" ? "repaid"
        : l.status === "REJECTED" ? "rejected"
        : "pending",
      purpose: l.purpose,
      interestRate: l.interestRate,
      term: l.repaymentMonths,
      nextPayment: l.expectedCompletion?.split("T")[0] ?? null,
      dueDate: l.expectedCompletion?.split("T")[0] ?? null,
      rejectNote: l.rejectionReason ?? undefined,
    }));

    const transactions: Transaction[] = [
      ...contributions.map((c) => ({
        id: `tx_c_${c.id}`,
        type: "contribution" as const,
        amount: c.amount,
        date: c.date,
        reference: `CONT-${c.id.slice(-6).toUpperCase()}`,
        status: "completed" as const,
      })),
      ...rawLoans
        .filter((l: any) => l.disbursementDate)
        .map((l: any) => ({
          id: `tx_l_${l.id}`,
          type: "loan_disbursement" as const,
          amount: l.amountApproved ?? l.amountRequested,
          date: l.disbursementDate.split("T")[0],
          reference: `LOAN-${l.id.slice(-6).toUpperCase()}`,
          status: "completed" as const,
        })),
      ...rawLoans.flatMap((l: any) =>
        (l.repayments ?? []).map((r: any) => ({
          id: `tx_r_${r.id}`,
          type: "loan_repayment" as const,
          amount: -r.amountPaid,
          date: r.paymentDate?.split("T")[0] ?? "",
          reference: r.transactionRef ?? `RPY-${r.id.slice(-6).toUpperCase()}`,
          status: "completed" as const,
        }))
      ),
    ].sort((a, b) => b.date.localeCompare(a.date));

    useMemberDataStore.getState().hydrateFromApi(userId, { contributions, loans, transactions });
  } catch {
    // offline — use cached data already loaded by initForUser
  }
}

interface AuthState {
  user: User | null;
  sacco: SACCO | null;
  rulesAccepted: boolean;
  isLoading: boolean;
  login: (phone: string, pin: string) => Promise<void>;
  requestOtp: (phone: string) => Promise<string | undefined>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  lookupInviteCode: (code: string) => Promise<InviteCode>;
  registerAdmin: (params: {
    phone: string;
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
  }) => Promise<void>;
  joinSACCO: (params: {
    code: string;
    name: string;
    nationalId: string;
    phone: string;
    pin: string;
  }) => Promise<void>;
  createSACCO: (params: {
    name: string;
    contributionAmount: number;
    interestRate: number;
    rules: string[];
    customRule: string;
    logoColor: string;
  }) => Promise<void>;
  acceptRules: () => void;
  updateSACCORules: (rules: string[]) => Promise<void>;
  updateContributionDueDate: (date: string) => Promise<void>;
  refreshSacco: () => void;
  logout: () => void;
  checkAuth: () => void;
  clearAppCache: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  sacco: null,
  rulesAccepted: false,
  isLoading: true,

  login: async (phone, pin) => {
    let sessionData: AuthSessionResponse;
    try {
      const res = await authApi.login(phone.trim(), pin);
      sessionData = res.data.data;
    } catch (apiError) {
      // API unreachable — fall back to mock (local dev / offline)
      try {
        sessionData = mockLogin(phone.trim(), pin);
      } catch {
        throw new Error(getApiErrorMessage(apiError));
      }
    }
    const { user, sacco } = persistSession(sessionData);
    if (user.role === "member") {
      useMemberDataStore.getState().initForUser(user.id);
      syncMemberData(user.id);
    } else {
      useMemberDataStore.getState().resetSession();
    }
    set({ user, sacco, rulesAccepted: true });
  },

  requestOtp: async (phone) => {
    const res = await authApi.requestOtp(phone.trim());
    return res.data.dev_otp;
  },

  verifyOtp: async (phone, code) => {
    await authApi.verifyOtp(phone.trim(), code);
  },

  lookupInviteCode: async (code) => {
    const upper = code.trim().toUpperCase();
    try {
      const res = await authApi.validateInvite(upper);
      const data = res.data.data;
      return {
        code: data.inviteCode,
        saccoId: data.id,
        saccoName: data.name,
        phone: "",
        adminName: data.adminName,
        contributionAmount: data.contributionAmount,
        interestRate: data.interestRate,
        meetingDay: data.meetingDay ?? undefined,
        memberCount: data.memberCount,
      };
    } catch (e) {
      throw new Error(getApiErrorMessage(e));
    }
  },

  registerAdmin: async (params) => {
    try {
      const res = await authApi.registerAdmin({
        phoneNumber: params.phone.trim(),
        fullName: params.fullName.trim(),
        nationalId: params.nationalId?.trim() || undefined,
        pin: params.pin,
        saccoName: params.saccoName.trim(),
        registrationNo: params.registrationNo?.trim() || undefined,
        contributionAmount: params.contributionAmount,
        maxLoanMultiplier: params.maxLoanMultiplier,
        interestRate: params.interestRate,
        loanTermMonths: params.loanTermMonths,
        meetingDay: params.meetingDay?.trim() || undefined,
        rulesText: params.rulesText?.trim() || undefined,
      });
      const { user, sacco } = persistSession(res.data.data);
      useMemberDataStore.getState().resetSession();
      set({ user, sacco, rulesAccepted: true });
    } catch (e) {
      throw new Error(getApiErrorMessage(e));
    }
  },

  joinSACCO: async ({ code, name, nationalId, phone, pin }) => {
    try {
      const res = await authApi.registerMember({
        phoneNumber: phone.trim(),
        fullName: name.trim(),
        nationalId: nationalId.trim() || undefined,
        pin,
        inviteCode: code.trim().toUpperCase(),
      });
      const { user, sacco } = persistSession(res.data.data);
      useMemberDataStore.getState().initForUser(user.id);
      set({ user, sacco, rulesAccepted: true });
    } catch (e) {
      throw new Error(getApiErrorMessage(e));
    }
  },

  createSACCO: async ({ name, contributionAmount, interestRate, rules, customRule, logoColor }) => {
    const { user } = get();
    if (!user) throw new Error("Not logged in.");
    const allRules = customRule.trim() ? [...rules, customRule.trim()] : rules;
    const sacco: SACCO = {
      id: user.saccoId ?? `sacco_${Date.now()}`,
      name,
      contributionAmount,
      interestRate,
      contributionDueDate: defaultContributionDueDate(5),
      rules: allRules,
      adminId: user.id,
      logoColor,
    };
    storage.set("sacco", JSON.stringify(sacco));
    const updatedUser = { ...user, saccoId: sacco.id, saccoName: sacco.name };
    storage.set("user", JSON.stringify(updatedUser));
    set({ user: updatedUser, sacco, rulesAccepted: true });
  },

  updateSACCORules: async (rules) => {
    const { sacco } = get();
    if (!sacco) throw new Error("No SACCO found.");
    const updated: SACCO = { ...sacco, rules };
    storage.set("sacco", JSON.stringify(updated));
    set({ sacco: updated });
  },

  updateContributionDueDate: async (date) => {
    const { sacco } = get();
    if (!sacco) throw new Error("No SACCO found.");
    const updated: SACCO = { ...sacco, contributionDueDate: date };
    storage.set("sacco", JSON.stringify(updated));
    set({ sacco: updated });
  },

  refreshSacco: () => {
    const sessionSacco = storage.getString("sacco");
    if (sessionSacco) set({ sacco: JSON.parse(sessionSacco) });
  },

  acceptRules: () => {
    const { user } = get();
    if (user) storage.set(`rules_accepted_${user.id}`, true);
    set({ rulesAccepted: true });
  },

  logout: () => {
    clearAccessToken();
    storage.delete("user");
    storage.delete("sacco");
    useMemberDataStore.getState().resetSession();
    set({ user: null, sacco: null, rulesAccepted: false, isLoading: false });
  },

  checkAuth: () => {
    const storedUser = storage.getString("user");
    const token = storage.getString("token");
    if (storedUser && token) {
      const user = JSON.parse(storedUser);
      const sessionSacco = storage.getString("sacco");
      const sacco = sessionSacco ? JSON.parse(sessionSacco) : null;
      if (user.role === "member") {
        useMemberDataStore.getState().initForUser(user.id);
        syncMemberData(user.id); // background refresh, falls back to cache if offline
      } else {
        useMemberDataStore.getState().resetSession();
      }
      set({ user, sacco, rulesAccepted: true, isLoading: false });
    } else {
      useMemberDataStore.getState().resetSession();
      set({ isLoading: false });
    }
  },

  clearAppCache: () => {
    clearAccessToken();
    storage.clearAll();
    new MMKV({ id: "member_data" }).clearAll();
    new MMKV({ id: "loans" }).clearAll();
    new MMKV({ id: "announcements" }).clearAll();
    new MMKV({ id: "ui" }).clearAll();
    useMemberDataStore.getState().resetSession();
    useLoanStore.getState().resetLoans();
    useAnnouncementStore.getState().resetAnnouncements();
    set({ user: null, sacco: null, rulesAccepted: false });
  },
}));

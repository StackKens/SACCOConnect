import { create } from "zustand";
import { createMMKV } from "react-native-mmkv";
import { User, SACCO, InviteCode } from "../types";
import { useMemberDataStore } from "./member.store";

const storage = createMMKV({ id: "auth" });

// ── Demo data ────────────────────────────────────────────────────
const DEMO_SACCO: SACCO = {
  id: "sacco_demo",
  name: "UgandaSavings SACCO",
  contributionAmount: 50000,
  interestRate: 12,
  rules: [
    "Monthly contributions must be paid by the 5th of every month.",
    "Late contributions attract a 5% penalty fee.",
    "Loan limit is 3× your total savings.",
    "Loans must be repaid within the agreed term. Defaulters are suspended.",
    "Members must give 30 days notice before withdrawing from the group.",
    "All financial disputes are resolved by a majority vote of members.",
  ],
  adminId: "admin_1",
  logoColor: "#3B82F6",
};

const DEMO_ADMIN: User = {
  id: "admin_1",
  name: "Admin Demo",
  phone: "0700000000",
  role: "admin",
  saccoId: "sacco_demo",
  saccoName: "UgandaSavings SACCO",
};

const DEMO_MEMBER: User = {
  id: "member_demo",
  name: "John Mukasa",
  phone: "0711111111",
  role: "member",
  saccoId: "sacco_demo",
  saccoName: "UgandaSavings SACCO",
};

// Active invite codes: code → InviteCode
const DEMO_INVITES: Record<string, InviteCode> = {
  "ABC123": { code: "ABC123", saccoId: "sacco_demo", saccoName: "UgandaSavings SACCO", phone: "" },
};

// ── Store ────────────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  sacco: SACCO | null;
  rulesAccepted: boolean;
  isLoading: boolean;
  login: (phone: string, pin: string) => Promise<void>;
  lookupInviteCode: (code: string) => Promise<InviteCode>;
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
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  sacco: null,
  rulesAccepted: false,
  isLoading: true,

  login: async (phone, pin) => {
    if (phone === "0700000000" && pin === "0000") {
      storage.set("user", JSON.stringify(DEMO_ADMIN));
      storage.set("sacco", JSON.stringify(DEMO_SACCO));
      useMemberDataStore.getState().resetSession();
      set({ user: DEMO_ADMIN, sacco: DEMO_SACCO, rulesAccepted: true });
      return;
    }
    if (phone === "0711111111" && pin === "1111") {
      storage.set("user", JSON.stringify(DEMO_MEMBER));
      storage.set("sacco", JSON.stringify(DEMO_SACCO));
      const accepted = storage.getBoolean(`rules_accepted_${DEMO_MEMBER.id}`) ?? true;
      useMemberDataStore.getState().initForUser(DEMO_MEMBER.id);
      set({ user: DEMO_MEMBER, sacco: DEMO_SACCO, rulesAccepted: accepted });
      return;
    }
    const stored = storage.getString(`member_${phone}`);
    if (!stored) throw new Error("Phone number not registered.");
    const { user, sacco, storedPin } = JSON.parse(stored);
    if (storedPin !== pin) throw new Error("Incorrect PIN.");
    const accepted = storage.getBoolean(`rules_accepted_${user.id}`) ?? false;
    storage.set("user", JSON.stringify(user));
    storage.set("sacco", JSON.stringify(sacco));
    useMemberDataStore.getState().initForUser(user.id);
    set({ user, sacco, rulesAccepted: accepted });
  },

  lookupInviteCode: async (code) => {
    const upper = code.trim().toUpperCase();
    // Check demo invites
    if (DEMO_INVITES[upper]) return DEMO_INVITES[upper];
    // Check stored invites (admin-created)
    const stored = storage.getString(`invite_${upper}`);
    if (stored) return JSON.parse(stored);
    throw new Error("Invalid or expired invite code.");
  },

  joinSACCO: async ({ code, name, nationalId, phone, pin }) => {
    const upper = code.trim().toUpperCase();
    const invite = DEMO_INVITES[upper] ?? (() => {
      const s = storage.getString(`invite_${upper}`);
      if (!s) throw new Error("Invalid invite code.");
      return JSON.parse(s) as InviteCode;
    })();

    const saccoStored = storage.getString(`sacco_${invite.saccoId}`);
    const sacco: SACCO = saccoStored ? JSON.parse(saccoStored) : DEMO_SACCO;

    const user: User = {
      id: `member_${Date.now()}`,
      name,
      phone,
      nationalId,
      role: "member",
      saccoId: invite.saccoId,
      saccoName: invite.saccoName,
    };

    storage.set(`member_${phone}`, JSON.stringify({ user, sacco, storedPin: pin }));
    storage.set("user", JSON.stringify(user));
    storage.set("sacco", JSON.stringify(sacco));
    useMemberDataStore.getState().initForUser(user.id);
    set({ user, sacco, rulesAccepted: false });
  },

  createSACCO: async ({ name, contributionAmount, interestRate, rules, customRule, logoColor }) => {
    const { user } = get();
    if (!user) throw new Error("Not logged in.");
    const allRules = customRule.trim() ? [...rules, customRule.trim()] : rules;
    const sacco: SACCO = {
      id: `sacco_${Date.now()}`,
      name,
      contributionAmount,
      interestRate,
      rules: allRules,
      adminId: user.id,
      logoColor,
    };
    storage.set(`sacco_${sacco.id}`, JSON.stringify(sacco));
    const updatedUser = { ...user, saccoId: sacco.id, saccoName: sacco.name };
    storage.set("user", JSON.stringify(updatedUser));
    storage.set("sacco", JSON.stringify(sacco));
    set({ user: updatedUser, sacco, rulesAccepted: true });
  },

  acceptRules: () => {
    const { user } = get();
    if (user) storage.set(`rules_accepted_${user.id}`, true);
    set({ rulesAccepted: true });
  },

  logout: () => {
    storage.delete("user");
    storage.delete("sacco");
    useMemberDataStore.getState().resetSession();
    set({ user: null, sacco: null, rulesAccepted: false });
  },

  checkAuth: () => {
    const storedUser = storage.getString("user");
    const storedSacco = storage.getString("sacco");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const accepted = storage.getBoolean(`rules_accepted_${user.id}`) ?? user.role === "admin";
      if (user.role === "member") {
        useMemberDataStore.getState().initForUser(user.id);
      } else {
        useMemberDataStore.getState().resetSession();
      }
      set({
        user,
        sacco: storedSacco ? JSON.parse(storedSacco) : null,
        rulesAccepted: accepted,
        isLoading: false,
      });
    } else {
      useMemberDataStore.getState().resetSession();
      set({ isLoading: false });
    }
  },
}));

import { create } from "zustand";
import { createMMKV } from "react-native-mmkv";
import { User, SACCO, InviteCode } from "../types";

const storage = createMMKV({ id: "auth" });

// ── Demo data ────────────────────────────────────────────────────
const DEMO_SACCO: SACCO = {
  id: "sacco_demo",
  name: "UgandaSavings SACCO",
  contributionAmount: 50000,
  interestRate: 12,
  rules: "Monthly contributions required. Loan limit is 3x savings.",
  adminId: "admin_1",
};

const DEMO_ADMIN: User = {
  id: "admin_1",
  name: "Admin Demo",
  phone: "0700000000",
  role: "admin",
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
  isLoading: boolean;
  // Returning user: phone + PIN
  login: (phone: string, pin: string) => Promise<void>;
  // First time: invite code → returns SACCO name for confirmation
  lookupInviteCode: (code: string) => Promise<InviteCode>;
  // Complete join after confirmation
  joinSACCO: (params: {
    code: string;
    name: string;
    nationalId: string;
    phone: string;
    pin: string;
  }) => Promise<void>;
  // Admin: create a new SACCO
  createSACCO: (params: {
    name: string;
    contributionAmount: number;
    interestRate: number;
    rules: string;
  }) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  sacco: null,
  isLoading: true,

  login: async (phone, pin) => {
    // Demo: admin shortcut
    if (phone === "0700000000" && pin === "0000") {
      storage.set("user", JSON.stringify(DEMO_ADMIN));
      storage.set("sacco", JSON.stringify(DEMO_SACCO));
      set({ user: DEMO_ADMIN, sacco: DEMO_SACCO });
      return;
    }
    // Real: look up stored member by phone
    const stored = storage.getString(`member_${phone}`);
    if (!stored) throw new Error("Phone number not registered.");
    const { user, sacco, storedPin } = JSON.parse(stored);
    if (storedPin !== pin) throw new Error("Incorrect PIN.");
    set({ user, sacco });
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
    set({ user, sacco });
  },

  createSACCO: async ({ name, contributionAmount, interestRate, rules }) => {
    const { user } = get();
    if (!user) throw new Error("Not logged in.");
    const sacco: SACCO = {
      id: `sacco_${Date.now()}`,
      name,
      contributionAmount,
      interestRate,
      rules,
      adminId: user.id,
    };
    storage.set(`sacco_${sacco.id}`, JSON.stringify(sacco));
    const updatedUser = { ...user, saccoId: sacco.id, saccoName: sacco.name };
    storage.set("user", JSON.stringify(updatedUser));
    storage.set("sacco", JSON.stringify(sacco));
    set({ user: updatedUser, sacco });
  },

  logout: () => {
    storage.delete("user");
    storage.delete("sacco");
    set({ user: null, sacco: null });
  },

  checkAuth: () => {
    const storedUser = storage.getString("user");
    const storedSacco = storage.getString("sacco");
    if (storedUser) {
      set({
        user: JSON.parse(storedUser),
        sacco: storedSacco ? JSON.parse(storedSacco) : null,
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
    }
  },
}));

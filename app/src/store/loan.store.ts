import { create } from "zustand";
import { MMKV } from "react-native-mmkv";
import { useMemberDataStore } from "./member.store";

const storage = new MMKV({ id: "loans" });

export type LoanStatus = "pending" | "approved" | "rejected";

export interface LoanApplication {
  id: string;
  memberLoanId: string;
  memberId: string;
  memberName: string;
  saccoId: string;
  amount: number;
  term: number;
  purpose: string;
  date: string;
  status: LoanStatus;
  memberSince: string;
  totalSavings: number;
  interestRate: number;
  repaid: number;
  dueDate?: string;
  rejectNote?: string;
}

function load(): LoanApplication[] {
  const stored = storage.getString("applications");
  return stored ? JSON.parse(stored) : [];
}

function save(loans: LoanApplication[]) {
  storage.set("applications", JSON.stringify(loans));
}

interface LoanStore {
  loans: LoanApplication[];
  addFromMemberApplication: (
    app: Omit<LoanApplication, "status" | "memberSince" | "repaid">,
  ) => void;
  approveLoan: (id: string) => void;
  rejectLoan: (id: string, note?: string) => void;
  getById: (id: string) => LoanApplication | undefined;
  resetLoans: () => void;
}

export const useLoanStore = create<LoanStore>((set, get) => ({
  loans: load(),

  addFromMemberApplication: (app) => {
    const loan: LoanApplication = {
      ...app,
      status: "pending",
      memberSince: new Date().toISOString().split("T")[0],
      repaid: 0,
    };
    const loans = [loan, ...get().loans];
    save(loans);
    set({ loans });
  },

  approveLoan: (id) => {
    const loan = get().loans.find((l) => l.id === id);
    if (!loan) return;

    const dueDate = new Date(Date.now() + loan.term * 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const nextPayment = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const loans = get().loans.map((l) =>
      l.id === id ? { ...l, status: "approved" as LoanStatus, dueDate } : l,
    );
    save(loans);
    set({ loans });

    useMemberDataStore.getState().activateLoan(loan.memberId, loan.memberLoanId, dueDate, nextPayment);
  },

  rejectLoan: (id, note) => {
    const loan = get().loans.find((l) => l.id === id);
    if (!loan) return;

    const loans = get().loans.map((l) =>
      l.id === id ? { ...l, status: "rejected" as LoanStatus, rejectNote: note ?? "" } : l,
    );
    save(loans);
    set({ loans });

    useMemberDataStore.getState().rejectLoan(loan.memberId, loan.memberLoanId, note);
  },

  getById: (id) => get().loans.find((l) => l.id === id),

  resetLoans: () => {
    save([]);
    set({ loans: [] });
  },
}));

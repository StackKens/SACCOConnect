import { create } from "zustand";
import { MMKV } from "react-native-mmkv";
import { useLoanStore } from "./loan.store";

const storage = new MMKV({ id: "member_data" });

export const DEMO_MEMBER_ID = "member_demo";

export type ContributionStatus = "completed" | "pending";
export type LoanStatus = "active" | "pending" | "repaid" | "rejected";
export type TxType = "contribution" | "loan_repayment" | "loan_disbursement";

export interface Contribution {
  id: string;
  amount: number;
  date: string;
  status: ContributionStatus;
  method: string;
}

export interface MemberLoan {
  id: string;
  amount: number;
  repaid: number;
  status: LoanStatus;
  purpose: string;
  interestRate: number;
  term: number;
  nextPayment: string | null;
  dueDate: string | null;
  rejectNote?: string;
}

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  date: string;
  reference: string;
  status: "completed";
}

const INITIAL_CONTRIBUTIONS: Contribution[] = [
  { id: "c1", amount: 50000, date: "2025-06-01", status: "completed", method: "MTN Mobile Money" },
  { id: "c2", amount: 50000, date: "2025-05-01", status: "completed", method: "Airtel Money" },
  { id: "c3", amount: 50000, date: "2025-04-01", status: "completed", method: "Bank Transfer" },
];

const INITIAL_LOANS: MemberLoan[] = [
  {
    id: "ml1",
    amount: 150000,
    repaid: 50000,
    status: "active",
    purpose: "Business",
    interestRate: 12,
    term: 12,
    nextPayment: "2025-07-01",
    dueDate: "2025-12-01",
  },
  {
    id: "ml2",
    amount: 100000,
    repaid: 100000,
    status: "repaid",
    purpose: "Education",
    interestRate: 12,
    term: 12,
    nextPayment: null,
    dueDate: null,
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "t1", type: "contribution", amount: 50000, date: "2025-06-01", reference: "CONT-001", status: "completed" },
  { id: "t2", type: "loan_repayment", amount: 25000, date: "2025-05-20", reference: "REPAY-001", status: "completed" },
  { id: "t3", type: "loan_disbursement", amount: 150000, date: "2025-05-01", reference: "LOAN-001", status: "completed" },
  { id: "t4", type: "contribution", amount: 50000, date: "2025-05-01", reference: "CONT-002", status: "completed" },
  { id: "t5", type: "contribution", amount: 50000, date: "2025-04-01", reference: "CONT-003", status: "completed" },
];

function storageKey(userId: string, key: string) {
  return `${userId}_${key}`;
}

function loadUserData(userId: string) {
  const isDemo = userId === DEMO_MEMBER_ID;
  return {
    contributions: loadKey(storageKey(userId, "contributions"), isDemo ? INITIAL_CONTRIBUTIONS : []),
    loans: loadKey(storageKey(userId, "loans"), isDemo ? INITIAL_LOANS : []),
    transactions: loadKey(storageKey(userId, "transactions"), isDemo ? INITIAL_TRANSACTIONS : []),
  };
}

export function getMemberData(userId: string) {
  return loadUserData(userId);
}

function loadKey<T>(key: string, fallback: T): T {
  const s = storage.getString(key);
  return s ? JSON.parse(s) : fallback;
}

function saveUserData(
  userId: string,
  data: { contributions: Contribution[]; loans: MemberLoan[]; transactions: Transaction[] },
) {
  storage.set(storageKey(userId, "contributions"), JSON.stringify(data.contributions));
  storage.set(storageKey(userId, "loans"), JSON.stringify(data.loans));
  storage.set(storageKey(userId, "transactions"), JSON.stringify(data.transactions));
}

interface MemberDataStore {
  userId: string | null;
  contributions: Contribution[];
  loans: MemberLoan[];
  transactions: Transaction[];
  initForUser: (userId: string) => void;
  resetSession: () => void;
  addContribution: (amount: number, method: string) => void;
  addLoanRepayment: (loanId: string, amount: number) => void;
  addLoanApplication: (params: {
    amount: number;
    purpose: string;
    interestRate: number;
    term: number;
    memberId: string;
    memberName: string;
    saccoId: string;
  }) => void;
  activateLoan: (memberId: string, loanId: string, dueDate: string, nextPayment: string) => void;
  rejectLoan: (memberId: string, loanId: string, note?: string) => void;
  totalSavings: () => number;
  activeLoan: () => MemberLoan | undefined;
}

export const useMemberDataStore = create<MemberDataStore>((set, get) => ({
  userId: null,
  contributions: [],
  loans: [],
  transactions: [],

  initForUser: (userId) => {
    const data = loadUserData(userId);
    set({ userId, ...data });
  },

  resetSession: () => {
    set({ userId: null, contributions: [], loans: [], transactions: [] });
  },

  totalSavings: () =>
    get().contributions.filter((c) => c.status === "completed").reduce((s, c) => s + c.amount, 0),

  activeLoan: () => get().loans.find((l) => l.status === "active"),

  addContribution: (amount, method) => {
    const userId = get().userId;
    if (!userId) return;

    const id = `c${Date.now()}`;
    const ref = `CONT-${Date.now().toString().slice(-4)}`;
    const date = new Date().toISOString().split("T")[0];
    const contribution: Contribution = { id, amount, date, status: "completed", method };
    const tx: Transaction = {
      id: `t${Date.now()}`,
      type: "contribution",
      amount,
      date,
      reference: ref,
      status: "completed",
    };
    const contributions = [contribution, ...get().contributions];
    const transactions = [tx, ...get().transactions];
    saveUserData(userId, { contributions, loans: get().loans, transactions });
    set({ contributions, transactions });
  },

  addLoanRepayment: (loanId, amount) => {
    const userId = get().userId;
    if (!userId) return;

    const loans = get().loans.map((l) => {
      if (l.id !== loanId) return l;
      const repaid = l.repaid + amount;
      return { ...l, repaid, status: repaid >= l.amount ? ("repaid" as LoanStatus) : l.status };
    });
    const ref = `REPAY-${Date.now().toString().slice(-4)}`;
    const date = new Date().toISOString().split("T")[0];
    const tx: Transaction = {
      id: `t${Date.now()}`,
      type: "loan_repayment",
      amount: -amount,
      date,
      reference: ref,
      status: "completed",
    };
    const transactions = [tx, ...get().transactions];
    saveUserData(userId, { contributions: get().contributions, loans, transactions });
    set({ loans, transactions });
  },

  addLoanApplication: ({ amount, purpose, interestRate, term, memberId, memberName, saccoId }) => {
    const userId = get().userId;
    if (!userId) return;

    const memberLoanId = `ml${Date.now()}`;
    const adminLoanId = `LA${Date.now()}`;
    const date = new Date().toISOString().split("T")[0];

    const loan: MemberLoan = {
      id: memberLoanId,
      amount,
      repaid: 0,
      status: "pending",
      purpose,
      interestRate,
      term,
      nextPayment: null,
      dueDate: null,
    };
    const loans = [loan, ...get().loans];
    saveUserData(userId, { contributions: get().contributions, loans, transactions: get().transactions });
    set({ loans });

    useLoanStore.getState().addFromMemberApplication({
      id: adminLoanId,
      memberLoanId,
      memberId,
      memberName,
      saccoId,
      amount,
      term,
      purpose,
      date,
      totalSavings: get().totalSavings(),
      interestRate,
    });
  },

  activateLoan: (memberId, loanId, dueDate, nextPayment) => {
    const data = loadUserData(memberId);
    const loans = data.loans.map((l) =>
      l.id === loanId
        ? { ...l, status: "active" as LoanStatus, dueDate, nextPayment }
        : l,
    );
    const date = new Date().toISOString().split("T")[0];
    const loan = data.loans.find((l) => l.id === loanId);
    const transactions = loan
      ? [
          {
            id: `t${Date.now()}`,
            type: "loan_disbursement" as TxType,
            amount: loan.amount,
            date,
            reference: `LOAN-${Date.now().toString().slice(-4)}`,
            status: "completed" as const,
          },
          ...data.transactions,
        ]
      : data.transactions;

    saveUserData(memberId, { ...data, loans, transactions });
    if (get().userId === memberId) {
      set({ loans, transactions });
    }
  },

  rejectLoan: (memberId, loanId, note) => {
    const data = loadUserData(memberId);
    const loans = data.loans.map((l) =>
      l.id === loanId ? { ...l, status: "rejected" as LoanStatus, rejectNote: note ?? "" } : l,
    );
    saveUserData(memberId, { ...data, loans });
    if (get().userId === memberId) {
      set({ loans });
    }
  },
}));

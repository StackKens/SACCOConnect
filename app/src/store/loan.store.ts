import { create } from "zustand";
import { createMMKV } from "react-native-mmkv";

const storage = createMMKV({ id: "loans" });

export type LoanStatus = "pending" | "approved" | "rejected";

export interface LoanApplication {
  id: string;
  memberName: string;
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

const INITIAL_LOANS: LoanApplication[] = [
  {
    id: "LA1",
    memberName: "John Doe",
    amount: 100000,
    term: 12,
    purpose: "Business",
    date: "2025-06-01",
    status: "pending",
    memberSince: "2023-01-10",
    totalSavings: 45000,
    interestRate: 12,
    repaid: 0,
  },
  {
    id: "LA2",
    memberName: "Jane Smith",
    amount: 50000,
    term: 6,
    purpose: "Education",
    date: "2025-05-28",
    status: "pending",
    memberSince: "2022-08-15",
    totalSavings: 30000,
    interestRate: 12,
    repaid: 0,
  },
  {
    id: "LA3",
    memberName: "Alice Wanjiku",
    amount: 50000,
    term: 8,
    purpose: "Medical",
    date: "2025-04-10",
    status: "approved",
    memberSince: "2021-03-20",
    totalSavings: 25000,
    interestRate: 12,
    repaid: 20000,
    dueDate: "2025-07-15",
  },
];

function load(): LoanApplication[] {
  const stored = storage.getString("loans");
  return stored ? JSON.parse(stored) : INITIAL_LOANS;
}

function save(loans: LoanApplication[]) {
  storage.set("loans", JSON.stringify(loans));
}

interface LoanStore {
  loans: LoanApplication[];
  approveLoan: (id: string) => void;
  rejectLoan: (id: string, note?: string) => void;
  getById: (id: string) => LoanApplication | undefined;
}

export const useLoanStore = create<LoanStore>((set, get) => ({
  loans: load(),

  approveLoan: (id) => {
    const loans = get().loans.map((l) =>
      l.id === id
        ? {
            ...l,
            status: "approved" as LoanStatus,
            dueDate: new Date(Date.now() + l.term * 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
          }
        : l,
    );
    save(loans);
    set({ loans });
  },

  rejectLoan: (id, note) => {
    const loans = get().loans.map((l) =>
      l.id === id
        ? { ...l, status: "rejected" as LoanStatus, rejectNote: note ?? "" }
        : l,
    );
    save(loans);
    set({ loans });
  },

  getById: (id) => get().loans.find((l) => l.id === id),
}));

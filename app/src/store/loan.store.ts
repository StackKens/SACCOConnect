import { create } from "zustand";
interface Loan {
  id: string;
  amount: number;
  repaid: number;
  remaining: number;
  status: "pending" | "active" | "repaid" | "rejected";
  nextPayment?: string;
  interestRate: number;
  termMonths: number;
  purpose: string;
  applicationDate: string;
}

interface LoanState {
  loans: Loan[];
  pendingApplications: Loan[];
  isLoading: boolean;
  applyForLoan: (
    loan: Omit<Loan, "id" | "status" | "applicationDate">,
  ) => Promise<void>;
  repayLoan: (loanId: string, amount: number) => Promise<void>;
  fetchLoans: () => Promise<void>;
}

// Dummy data
const dummyLoans: Loan[] = [
  {
    id: "L1",
    amount: 50000,
    repaid: 25000,
    remaining: 25000,
    status: "active",
    nextPayment: "2025-07-15",
    interestRate: 12,
    termMonths: 12,
    purpose: "Business",
    applicationDate: "2025-05-01",
  },
  {
    id: "L2",
    amount: 100000,
    repaid: 100000,
    remaining: 0,
    status: "repaid",
    interestRate: 10,
    termMonths: 24,
    purpose: "Education",
    applicationDate: "2024-06-01",
  },
];

export const useLoanStore = create<LoanState>((set, get) => ({
  loans: dummyLoans,
  pendingApplications: [],
  isLoading: false,
  applyForLoan: async (loanData) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const newLoan: Loan = {
      id: Date.now().toString(),
      ...loanData,
      repaid: 0,
      remaining: loanData.amount,
      status: "pending",
      applicationDate: new Date().toISOString(),
    };
    set((state) => ({
      pendingApplications: [newLoan, ...state.pendingApplications],
      isLoading: false,
    }));
  },
  repayLoan: async (loanId, amount) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    set((state) => ({
      loans: state.loans.map((loan) =>
        loan.id === loanId
          ? {
              ...loan,
              repaid: loan.repaid + amount,
              remaining: loan.remaining - amount,
              status: loan.remaining - amount <= 0 ? "repaid" : "active",
            }
          : loan,
      ),
      isLoading: false,
    }));
  },
  fetchLoans: async () => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({ loans: dummyLoans, isLoading: false });
  },
}));

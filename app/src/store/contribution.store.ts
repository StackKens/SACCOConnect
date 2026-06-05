import { create } from "zustand";
interface Contribution {
  id: string;
  amount: number;
  date: string;
  status: "pending" | "completed";
  method: string;
  reference?: string;
}

interface ContributionState {
  contributions: Contribution[];
  isLoading: boolean;
  totalSaved: number;
  addContribution: (
    contribution: Omit<Contribution, "id" | "status">,
  ) => Promise<void>;
  fetchContributions: () => Promise<void>;
}

const dummyContributions: Contribution[] = [
  {
    id: "C1",
    amount: 5000,
    date: "2025-06-01",
    status: "completed",
    method: "M-Pesa",
    reference: "MPESA-001",
  },
  {
    id: "C2",
    amount: 5000,
    date: "2025-05-01",
    status: "completed",
    method: "Bank Transfer",
  },
];

export const useContributionStore = create<ContributionState>((set, get) => ({
  contributions: dummyContributions,
  isLoading: false,
  totalSaved: dummyContributions.reduce((sum, c) => sum + c.amount, 0),
  addContribution: async (contributionData) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const newContribution: Contribution = {
      id: Date.now().toString(),
      ...contributionData,
      status: "completed",
    };
    set((state) => ({
      contributions: [newContribution, ...state.contributions],
      totalSaved: state.totalSaved + newContribution.amount,
      isLoading: false,
    }));
  },
  fetchContributions: async () => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({
      contributions: dummyContributions,
      totalSaved: dummyContributions.reduce((sum, c) => sum + c.amount, 0),
      isLoading: false,
    });
  },
}));

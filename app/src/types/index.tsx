export interface User {
  id: string;
  name: string;
  phone: string;
  role: "member" | "admin";
  saccoId?: string;
  saccoName?: string;
  nationalId?: string;
  avatar?: string;
}

export interface SACCO {
  id: string;
  name: string;
  contributionAmount: number;
  interestRate: number;
  rules?: string;
  adminId: string;
}

export interface InviteCode {
  code: string;
  saccoId: string;
  saccoName: string;
  phone: string;
}

export interface Contribution {
  id: string;
  amount: number;
  date: string;
  status: "pending" | "completed";
}

export interface Loan {
  id: string;
  amount: number;
  interestRate: number;
  termMonths: number;
  remainingBalance: number;
  nextPaymentDue: string;
  status: "active" | "pending" | "repaid" | "rejected";
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
}

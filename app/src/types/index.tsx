export interface User {
  id: string;
  name: string;
  email: string;
  role: "member" | "admin";
  avatar?: string;
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

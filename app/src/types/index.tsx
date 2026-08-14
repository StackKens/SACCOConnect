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
  contributionDueDate: string;
  rules: string[];
  customRule?: string;
  adminId: string;
  logoColor: string;
  inviteCode?: string;
  countryCode?: string;
  termsAccepted?: boolean;
  termsVersion?: string;
  paymentAccounts?: PaymentAccount[];
}

export type AccountType = "BANK" | "MOBILE_MONEY";

export interface PaymentAccount {
  id: string;
  type: AccountType;
  accountNumber: string;
  accountName: string;
  provider?: string | null;
  isActive: boolean;
  isMemberVisible: boolean;
  createdAt?: string;
}

export interface InviteCode {
  code: string;
  saccoId: string;
  saccoName: string;
  phone: string;
  adminName?: string;
  contributionAmount?: number;
  interestRate?: number;
  meetingDay?: string;
  memberCount?: number;
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

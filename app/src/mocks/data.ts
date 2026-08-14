/**
 * Mock fixtures for the offline mock API layer.
 * Mirrors the users in auth.mock.ts (same ids) so member and admin flows work offline.
 * Pure TS — no React Native imports.
 */

export interface MockMember {
  id: string;
  userId: string;
  fullName: string;
  nationalId: string | null;
  status: string;
  currentBalance: number;
  joinDate: string;
  phoneNumber: string;
  role: string;
}

export interface MockLoan {
  id: string;
  memberId: string;
  memberName: string;
  amountRequested: number;
  amountApproved: number | null;
  amountRepaid: number;
  status: string;
  purpose: string;
  interestRate: number;
  repaymentMonths: number;
  totalRepayable: number | null;
  disbursementDate: string | null;
  expectedCompletion: string | null;
  rejectionReason: string | null;
  reviewedBy: string | null;
  createdAt: string;
  repayments: { id: string; amountPaid: number; paymentDate: string; method: string }[];
  member: { id: string; fullName: string; saccoId: string };
}

export interface MockContribution {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
  transactionRef: string | null;
}

export interface MockAnnouncement {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

export const MOCK_SACCO = {
  id: "sacco_mock_001",
  name: "Kampala Unity SACCO",
  contributionAmount: 50000,
  interestRate: 12,
  loanTermMonths: 12,
  meetingDay: "Saturday",
  inviteCode: "UNITY6",
  countryCode: "UG",
  termsAccepted: true,
  termsVersion: "1",
  paymentAccounts: [
    {
      id: "payment_mock_001",
      type: "MOBILE_MONEY",
      accountNumber: "0772000123",
      accountName: "Kampala Unity SACCO",
      provider: "MTN",
      isActive: true,
      isMemberVisible: true,
      createdAt: "2021-03-01T00:00:00.000Z",
    },
    {
      id: "payment_mock_002",
      type: "BANK",
      accountNumber: "1001234567890",
      accountName: "Kampala Unity SACCO",
      provider: "Stanbic Bank",
      isActive: true,
      isMemberVisible: false,
      createdAt: "2021-03-01T00:00:00.000Z",
    },
  ],
};

export const MOCK_MEMBERS: MockMember[] = [
  {
    id: "member_admin_001",
    userId: "user_admin_001",
    fullName: "Daniel Ssekandi",
    nationalId: "CM900123456SSEK",
    status: "ACTIVE",
    currentBalance: 600000,
    joinDate: "2021-03-01",
    phoneNumber: "0700000001",
    role: "ADMIN",
  },
  {
    id: "member_alice_002",
    userId: "user_alice_002",
    fullName: "Alice Wanjiku",
    nationalId: "CM870234567WANJ",
    status: "ACTIVE",
    currentBalance: 350000,
    joinDate: "2022-01-15",
    phoneNumber: "0700000002",
    role: "MEMBER",
  },
  {
    id: "member_bob_003",
    userId: "user_bob_003",
    fullName: "Bob Omondi",
    nationalId: "CM910345678OMON",
    status: "ACTIVE",
    currentBalance: 220000,
    joinDate: "2022-06-01",
    phoneNumber: "0700000003",
    role: "MEMBER",
  },
  {
    id: "member_cathy_004",
    userId: "user_cathy_004",
    fullName: "Catherine Muthoni",
    nationalId: "CM930456789MUTH",
    status: "ACTIVE",
    currentBalance: 480000,
    joinDate: "2021-09-10",
    phoneNumber: "0700000004",
    role: "MEMBER",
  },
  {
    id: "member_james_005",
    userId: "user_james_005",
    fullName: "James Mukasa",
    nationalId: "CM950567890MUKA",
    status: "INACTIVE",
    currentBalance: 100000,
    joinDate: "2023-02-20",
    phoneNumber: "0700000005",
    role: "MEMBER",
  },
  {
    id: "member_grace_006",
    userId: "user_grace_006",
    fullName: "Grace Nakato",
    nationalId: "CM960678901NAKA",
    status: "ACTIVE",
    currentBalance: 150000,
    joinDate: "2023-09-05",
    phoneNumber: "0700000006",
    role: "MEMBER",
  },
];

export const MOCK_LOANS: MockLoan[] = [
  {
    id: "loan_mock_active_001",
    memberId: "member_alice_002",
    memberName: "Alice Wanjiku",
    amountRequested: 300000,
    amountApproved: 300000,
    amountRepaid: 106000,
    status: "ACTIVE",
    purpose: "Business expansion — stock purchase",
    interestRate: 12,
    repaymentMonths: 6,
    totalRepayable: 318000,
    disbursementDate: "2025-01-10",
    expectedCompletion: "2025-07-10",
    rejectionReason: null,
    reviewedBy: "user_admin_001",
    createdAt: "2025-01-05T10:00:00.000Z",
    repayments: [
      {
        id: "rpy_001",
        amountPaid: 53000,
        paymentDate: "2025-02-05",
        method: "MOBILE_MONEY",
      },
      {
        id: "rpy_002",
        amountPaid: 53000,
        paymentDate: "2025-03-05",
        method: "MOBILE_MONEY",
      },
    ],
    member: { id: "member_alice_002", fullName: "Alice Wanjiku", saccoId: MOCK_SACCO.id },
  },
  {
    id: "loan_mock_repaid_001",
    memberId: "member_cathy_004",
    memberName: "Catherine Muthoni",
    amountRequested: 150000,
    amountApproved: 150000,
    amountRepaid: 154500,
    status: "REPAID",
    purpose: "School fees",
    interestRate: 12,
    repaymentMonths: 3,
    totalRepayable: 154500,
    disbursementDate: "2024-08-01",
    expectedCompletion: "2024-11-01",
    rejectionReason: null,
    reviewedBy: "user_admin_001",
    createdAt: "2024-07-20T10:00:00.000Z",
    repayments: [],
    member: { id: "member_cathy_004", fullName: "Catherine Muthoni", saccoId: MOCK_SACCO.id },
  },
  {
    id: "loan_mock_pending_001",
    memberId: "member_bob_003",
    memberName: "Bob Omondi",
    amountRequested: 200000,
    amountApproved: null,
    amountRepaid: 0,
    status: "AWAITING_GUARANTORS",
    purpose: "Medical emergency",
    interestRate: 12,
    repaymentMonths: 4,
    totalRepayable: 208000,
    disbursementDate: null,
    expectedCompletion: null,
    rejectionReason: null,
    reviewedBy: null,
    createdAt: "2025-06-20T10:00:00.000Z",
    repayments: [],
    member: { id: "member_bob_003", fullName: "Bob Omondi", saccoId: MOCK_SACCO.id },
  },
];

export const MOCK_CONTRIBUTIONS: MockContribution[] = [
  { id: "c1", memberId: "member_alice_002", memberName: "Alice Wanjiku", amount: 50000, method: "MOBILE_MONEY", status: "CONFIRMED", createdAt: "2025-06-01T08:00:00.000Z", transactionRef: "TXN-ALICE-01" },
  { id: "c2", memberId: "member_bob_003", memberName: "Bob Omondi", amount: 50000, method: "BANK_TRANSFER", status: "CONFIRMED", createdAt: "2025-06-01T08:05:00.000Z", transactionRef: "TXN-BOB-01" },
  { id: "c3", memberId: "member_cathy_004", memberName: "Catherine Muthoni", amount: 50000, method: "MOBILE_MONEY", status: "CONFIRMED", createdAt: "2025-06-01T08:10:00.000Z", transactionRef: "TXN-CATHY-01" },
  { id: "c4", memberId: "member_bob_003", memberName: "Bob Omondi", amount: 50000, method: "CASH", status: "PENDING", createdAt: "2025-06-02T09:00:00.000Z", transactionRef: null },
];

export const MOCK_ANNOUNCEMENTS: MockAnnouncement[] = [
  { id: "a1", title: "AGM Notice", content: "Annual General Meeting scheduled for June 30th. All members are required to attend.", author: "Daniel Ssekandi", createdAt: "2025-06-01T09:00:00.000Z" },
  { id: "a2", title: "Dividend Payout", content: "Dividends for the 2024/2025 financial year will be credited to all member accounts by June 15th.", author: "Daniel Ssekandi", createdAt: "2025-05-28T09:00:00.000Z" },
];

export function memberById(memberId: string): MockMember | undefined {
  return MOCK_MEMBERS.find((m) => m.id === memberId);
}

export function memberByUserId(userId: string): MockMember | undefined {
  return MOCK_MEMBERS.find((m) => m.userId === userId);
}

export function loansForMember(memberId: string): MockLoan[] {
  return MOCK_LOANS.filter((l) => l.memberId === memberId);
}

export function activeLoanForMember(memberId: string): MockLoan | null {
  return MOCK_LOANS.find((l) => l.memberId === memberId && l.status === "ACTIVE") ?? null;
}

export function contributionsForMember(memberId: string): MockContribution[] {
  return MOCK_CONTRIBUTIONS.filter((c) => c.memberId === memberId);
}

export function treasuryStats() {
  const totalSavings = MOCK_MEMBERS.reduce((sum, m) => sum + m.currentBalance, 0);
  const activeLoans = MOCK_LOANS.filter((l) => l.status === "ACTIVE");
  const totalDisbursed = activeLoans.reduce((s, l) => s + (l.amountApproved ?? 0), 0);
  const totalRepaid = activeLoans.reduce((s, l) => s + l.amountRepaid, 0);
  const outstanding = Math.max(totalDisbursed - totalRepaid, 0);
  const collectionRate = totalDisbursed
    ? Math.round((totalRepaid / totalDisbursed) * 100)
    : 0;
  return {
    totalSavings,
    totalDisbursed,
    totalRepaid,
    outstanding,
    collectionRate,
    monthlyData: [
      { month: "2025-01", collections: 200000, disbursed: 300000 },
      { month: "2025-02", collections: 250000, disbursed: 0 },
      { month: "2025-03", collections: 250000, disbursed: 0 },
      { month: "2025-04", collections: 250000, disbursed: 0 },
      { month: "2025-05", collections: 250000, disbursed: 0 },
      { month: "2025-06", collections: 200000, disbursed: 0 },
    ],
    recentTransactions: [
      { id: "tx1", member: "Alice Wanjiku", type: "contribution", amount: 50000, date: "2025-06-01T08:00:00.000Z" },
      { id: "tx2", member: "Bob Omondi", type: "contribution", amount: 50000, date: "2025-06-01T08:05:00.000Z" },
      { id: "tx3", member: "Catherine Muthoni", type: "contribution", amount: 50000, date: "2025-06-01T08:10:00.000Z" },
      { id: "tx4", member: "Alice Wanjiku", type: "loan repayment", amount: -53000, date: "2025-03-05T08:00:00.000Z" },
    ],
  };
}

export function eligibilityFor(member: MockMember) {
  const activeLoan = activeLoanForMember(member.id);
  return {
    currentBalance: member.currentBalance,
    hasActiveLoan: Boolean(activeLoan),
    maxAmount: member.currentBalance * 3,
    maxLoanMultiplier: 3,
    minMonths: 3,
    activeLoanAmount: activeLoan?.amountApproved ?? null,
    reason: activeLoan ? "You have an active loan" : undefined,
  };
}

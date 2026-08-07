/**
 * Mock request handlers for the offline mock API layer.
 * Matches the endpoints the app calls (see screens/stores) and returns
 * axios-shaped { data } responses. Pure TS.
 */

import {
  MOCK_SACCO,
  MOCK_MEMBERS,
  MOCK_LOANS,
  MOCK_CONTRIBUTIONS,
  MOCK_ANNOUNCEMENTS,
  memberById,
  memberByUserId,
  loansForMember,
  activeLoanForMember,
  contributionsForMember,
  treasuryStats,
  eligibilityFor,
  MockContribution,
  MockLoan,
  MockAnnouncement,
} from "./data";
import { getScenario } from "./scenarios";

export interface MockResponse {
  status: number;
  data: unknown;
}

export interface MockRequest {
  method: string;
  path: string;
  /** Query string from the URL, without leading '?'. */
  query?: string;
  body?: unknown;
  /** Extracted from the Authorization header, e.g. "mock_token_alice". */
  token?: string;
}

/** Look up the active mock member from the bearer token. */
function memberFromToken(token?: string) {
  const tokenId = token?.replace("Bearer ", "");
  if (!tokenId) return MOCK_MEMBERS[1]; // default: Alice (member)
  if (tokenId.includes("admin")) return memberByUserId("user_admin_001") ?? MOCK_MEMBERS[0];
  const userMatch = tokenId.match(/user_(\w+)_\d+/);
  if (userMatch) {
    const byPhone = MOCK_MEMBERS.find((m) => m.phoneNumber === tokenId);
    if (byPhone) return byPhone;
  }
  // Fall back by matching the named suffix in the token (alice/bob/...).
  const nameToken = tokenId.replace("mock_token_", "");
  const byName = MOCK_MEMBERS.find(
    (m) => m.userId.includes(nameToken) || m.fullName.toLowerCase().includes(nameToken),
  );
  return byName ?? MOCK_MEMBERS[1];
}

function ok(data: unknown): MockResponse {
  return { status: 200, data: { success: true, data } };
}

function created(data: unknown): MockResponse {
  return { status: 201, data: { success: true, data } };
}

export function handleMockRequest(req: MockRequest): MockResponse {
  const method = req.method.toUpperCase();
  const scenario = getScenario(method, req.path);
  if (scenario) {
    if (scenario.type === "error") {
      return {
        status: scenario.status,
        data: { success: false, message: scenario.message },
      };
    }
    return { status: 200, data: { success: true, data: [] } };
  }

  const member = memberFromToken(req.token);

  // ---- auth (only invite lookup is called through the api layer) ----
  if (method === "GET" && req.path.startsWith("/api/auth/invite/")) {
    const code = decodeURIComponent(req.path.split("/").pop() ?? "").toUpperCase();
    if (code !== MOCK_SACCO.inviteCode) {
      return { status: 404, data: { success: false, message: "Invalid invite code" } };
    }
    return ok({
      id: MOCK_SACCO.id,
      name: MOCK_SACCO.name,
      contributionAmount: MOCK_SACCO.contributionAmount,
      interestRate: MOCK_SACCO.interestRate,
      loanTermMonths: MOCK_SACCO.loanTermMonths,
      meetingDay: MOCK_SACCO.meetingDay,
      inviteCode: MOCK_SACCO.inviteCode,
      adminName: "Daniel Ssekandi",
      memberCount: MOCK_MEMBERS.length,
    });
  }

  // ---- members ----
  if (req.path === "/api/members/me") {
    return ok({
      ...member,
      user: { phoneNumber: member.phoneNumber, role: member.role },
      streak: { currentStreak: 6, longestStreak: 12, lastContributionDate: "2025-06-01" },
      sacco: MOCK_SACCO,
    });
  }

  if (req.path === "/api/members/me/eligibility") {
    return ok(eligibilityFor(member));
  }

  if (req.path === "/api/members/sacco-members") {
    return ok(
      MOCK_MEMBERS.filter((m) => m.status === "ACTIVE" && m.id !== member.id).map(
        (m) => ({ id: m.id, fullName: m.fullName, user: { phoneNumber: m.phoneNumber } }),
      ),
    );
  }

  if (req.path === "/api/members" && method === "GET") {
    return ok(
      MOCK_MEMBERS.map((m) => ({
        id: m.id,
        fullName: m.fullName,
        status: m.status,
        currentBalance: m.currentBalance,
        joinDate: m.joinDate,
        user: { phoneNumber: m.phoneNumber, role: m.role },
        streak: { currentStreak: 0 },
      })),
    );
  }

  if (req.path.startsWith("/api/members/") && method === "GET") {
    const id = req.path.split("/").pop() ?? "";
    const m = memberById(id);
    if (!m) return { status: 404, data: { success: false, message: "Member not found" } };
    return ok({
      ...m,
      user: { phoneNumber: m.phoneNumber, role: m.role },
      streak: { currentStreak: 0 },
      contributions: contributionsForMember(id),
      loans: loansForMember(id),
    });
  }

  // ---- loans ----
  if (req.path === "/api/loans/my" && method === "GET") {
    return ok(loansForMember(member.id));
  }

  if (req.path === "/api/loans/my/active" && method === "GET") {
    return ok(activeLoanForMember(member.id));
  }

  if (req.path === "/api/loans/queue" && method === "GET") {
    return ok(MOCK_LOANS.filter((l) => ["PENDING", "AWAITING_GUARANTORS", "UNDER_REVIEW"].includes(l.status)));
  }

  if (req.path === "/api/loans/active" && method === "GET") {
    return ok(MOCK_LOANS.filter((l) => l.status === "ACTIVE"));
  }

  if (req.path === "/api/loans/apply" && method === "POST") {
    const body = (req.body ?? {}) as { amountRequested?: number; purpose?: string; repaymentMonths?: number };
    const newLoan: MockLoan = {
      id: `loan_mock_new_${Date.now()}`,
      memberId: member.id,
      memberName: member.fullName,
      amountRequested: body.amountRequested ?? 100000,
      amountApproved: null,
      amountRepaid: 0,
      status: "AWAITING_GUARANTORS",
      purpose: body.purpose ?? "",
      interestRate: MOCK_SACCO.interestRate,
      repaymentMonths: body.repaymentMonths ?? 12,
      totalRepayable: null,
      disbursementDate: null,
      expectedCompletion: null,
      rejectionReason: null,
      reviewedBy: null,
      createdAt: new Date().toISOString(),
      repayments: [],
      member: { id: member.id, fullName: member.fullName, saccoId: MOCK_SACCO.id },
    };
    MOCK_LOANS.unshift(newLoan);
    return created({ loan: newLoan, repaymentSchedule: [] });
  }

  const loanByIdMatch = req.path.match(/^\/api\/loans\/([^/]+)\/(approve|reject|repay)$/);
  if (loanByIdMatch && method === "POST") {
    const loan = MOCK_LOANS.find((l) => l.id === loanByIdMatch[1]);
    if (!loan) return { status: 404, data: { success: false, message: "Loan not found" } };
    const action = loanByIdMatch[2];
    if (action === "approve") {
      loan.status = "ACTIVE";
      loan.amountApproved = loan.amountRequested;
      loan.totalRepayable = Math.round(loan.amountRequested * (1 + MOCK_SACCO.interestRate / 100 * loan.repaymentMonths / 12));
      loan.reviewedBy = member.userId;
      return ok(loan);
    }
    if (action === "reject") {
      loan.status = "REJECTED";
      loan.rejectionReason = (req.body as { reason?: string })?.reason ?? "Rejected";
      loan.reviewedBy = member.userId;
      return ok(loan);
    }
    if (action === "repay") {
      const amount = (req.body as { amountPaid?: number })?.amountPaid ?? 0;
      loan.amountRepaid += amount;
      loan.repayments.push({
        id: `rpy_mock_${Date.now()}`,
        amountPaid: amount,
        paymentDate: new Date().toISOString().slice(0, 10),
        method: "MOBILE_MONEY",
      });
      const fullyRepaid = loan.amountRepaid >= (loan.totalRepayable ?? loan.amountRequested);
      if (fullyRepaid) loan.status = "REPAID";
      return ok({ amountPaid: amount, fullyRepaid });
    }
  }

  // ---- contributions ----
  if (req.path === "/api/contributions/my" && method === "GET") {
    return ok(contributionsForMember(member.id));
  }

  if (req.path === "/api/contributions/treasury" && method === "GET") {
    return ok(treasuryStats());
  }

  if (req.path === "/api/contributions" && method === "GET") {
    return ok(MOCK_CONTRIBUTIONS);
  }

  if (req.path === "/api/contributions" && method === "POST") {
    const body = (req.body ?? {}) as { amount?: number; method?: string; transactionRef?: string };
    const c: MockContribution = {
      id: `c_mock_${Date.now()}`,
      memberId: member.id,
      memberName: member.fullName,
      amount: body.amount ?? MOCK_SACCO.contributionAmount,
      method: body.method ?? "MOBILE_MONEY",
      status: "CONFIRMED",
      createdAt: new Date().toISOString(),
      transactionRef: body.transactionRef ?? null,
    };
    MOCK_CONTRIBUTIONS.unshift(c);
    return created(c);
  }

  const confirmMatch = req.path.match(/^\/api\/contributions\/([^/]+)\/confirm$/);
  if (confirmMatch && method === "POST") {
    const c = MOCK_CONTRIBUTIONS.find((x) => x.id === confirmMatch[1]);
    if (!c) return { status: 404, data: { success: false, message: "Contribution not found" } };
    c.status = "CONFIRMED";
    return ok(c);
  }

  // ---- announcements ----
  if (req.path === "/api/announcements" && method === "GET") {
    return ok(MOCK_ANNOUNCEMENTS);
  }

  if (req.path === "/api/announcements" && method === "POST") {
    const body = (req.body ?? {}) as { title?: string; message?: string; author?: string };
    const a: MockAnnouncement = {
      id: `a_mock_${Date.now()}`,
      title: body.title ?? "",
      content: body.message ?? "",
      author: body.author ?? member.fullName,
      createdAt: new Date().toISOString(),
    };
    MOCK_ANNOUNCEMENTS.unshift(a);
    return created(a);
  }

  const deleteAnnouncementMatch = req.path.match(/^\/api\/announcements\/([^/]+)$/);
  if (deleteAnnouncementMatch && method === "DELETE") {
    const idx = MOCK_ANNOUNCEMENTS.findIndex((a) => a.id === deleteAnnouncementMatch[1]);
    if (idx === -1) return { status: 404, data: { success: false, message: "Announcement not found" } };
    MOCK_ANNOUNCEMENTS.splice(idx, 1);
    return ok({ message: "Deleted" });
  }

  // ---- invite send ----
  if (req.path === "/api/members/invite/send" && method === "POST") {
    return ok({
      inviteCode: MOCK_SACCO.inviteCode,
      saccoName: MOCK_SACCO.name,
    });
  }

  // ---- member status / delete ----
  const memberByIdMatch = req.path.match(/^\/api\/members\/([^/]+)\/status$/);
  if (memberByIdMatch && method === "PATCH") {
    const m = memberById(memberByIdMatch[1]);
    if (!m) return { status: 404, data: { success: false, message: "Member not found" } };
    m.status = (req.body as { status?: string })?.status ?? m.status;
    return ok(m);
  }

  const deleteMemberMatch = req.path.match(/^\/api\/members\/([^/]+)$/);
  if (deleteMemberMatch && method === "DELETE") {
    const idx = MOCK_MEMBERS.findIndex((m) => m.id === deleteMemberMatch[1]);
    if (idx === -1) return { status: 404, data: { success: false, message: "Member not found" } };
    MOCK_MEMBERS.splice(idx, 1);
    return ok({ message: "Member deleted" });
  }

  return {
    status: 404,
    data: { success: false, message: `Mock handler missing for ${method} ${req.path}` },
  };
}

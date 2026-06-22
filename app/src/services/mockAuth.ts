import { AuthSessionResponse } from "./auth.service";

// Mirror of seed.ts — for offline/local dev login
const MOCK_SACCO = {
  id: "sacco_mock_001",
  name: "Kampala Unity SACCO",
  contributionAmount: 50000,
  maxLoanMultiplier: 3,
  interestRate: 12,
  loanTermMonths: 12,
  meetingDay: "Saturday",
  rulesText:
    "1. Monthly contribution of UGX 50,000 due by the 5th\n2. Members must have 3 months of contributions to qualify for a loan\n3. Maximum loan is 3x your savings balance\n4. Late payments attract a 5% penalty\n5. Two guarantors required for any loan above UGX 100,000",
  inviteCode: "UNITY6",
};

const MOCK_USERS: Record<
  string,
  { pin: string; response: AuthSessionResponse }
> = {
  "0700000001": {
    pin: "1234",
    response: {
      accessToken: "mock_token_admin",
      refreshToken: "mock_refresh_admin",
      user: { id: "user_admin_001", role: "ADMIN", phoneNumber: "0700000001" },
      member: { id: "member_admin_001", fullName: "Daniel Ssekandi", nationalId: "CM900123456SSEK" },
      sacco: MOCK_SACCO,
    },
  },
  "0700000002": {
    pin: "1234",
    response: {
      accessToken: "mock_token_alice",
      refreshToken: "mock_refresh_alice",
      user: { id: "user_alice_002", role: "MEMBER", phoneNumber: "0700000002" },
      member: { id: "member_alice_002", fullName: "Alice Wanjiku", nationalId: "CM870234567WANJ" },
      sacco: MOCK_SACCO,
    },
  },
  "0700000003": {
    pin: "1234",
    response: {
      accessToken: "mock_token_bob",
      refreshToken: "mock_refresh_bob",
      user: { id: "user_bob_003", role: "MEMBER", phoneNumber: "0700000003" },
      member: { id: "member_bob_003", fullName: "Bob Omondi", nationalId: "CM910345678OMON" },
      sacco: MOCK_SACCO,
    },
  },
  "0700000004": {
    pin: "1234",
    response: {
      accessToken: "mock_token_cathy",
      refreshToken: "mock_refresh_cathy",
      user: { id: "user_cathy_004", role: "MEMBER", phoneNumber: "0700000004" },
      member: { id: "member_cathy_004", fullName: "Catherine Muthoni", nationalId: "CM930456789MUTH" },
      sacco: MOCK_SACCO,
    },
  },
};

export function mockLogin(phoneNumber: string, pin: string): AuthSessionResponse {
  const entry = MOCK_USERS[phoneNumber.trim()];
  if (!entry || entry.pin !== pin) {
    throw new Error("Invalid phone number or PIN");
  }
  return entry.response;
}

/**
 * Smoke tests for offline mock auth/OTP (USE_MOCK_API).
 * Run: npx tsx scripts/test-mocks.ts
 */
import { mockLogin } from "../app/src/mocks/auth.mock";
import { mockRequestOtp, mockVerifyOtp } from "../app/src/mocks/otp.mock";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

console.log("Mock auth — admin");
const admin = mockLogin("0700000001", "1234");
assert(admin.user.role === "ADMIN", "0700000001 is admin");
assert(admin.member?.fullName === "Daniel Ssekandi", "admin name");

console.log("Mock auth — 5 members");
const members = [
  { phone: "0700000002", name: "Alice Wanjiku" },
  { phone: "0700000003", name: "Bob Omondi" },
  { phone: "0700000004", name: "Catherine Muthoni" },
  { phone: "0700000005", name: "James Mukasa" },
  { phone: "0700000006", name: "Grace Nakato" },
];
for (const { phone, name } of members) {
  const session = mockLogin(phone, "1234");
  assert(session.user.role === "MEMBER", `${phone} is member`);
  assert(session.member?.fullName === name, `${phone} → ${name}`);
}

console.log("Mock auth — invalid credentials");
try {
  mockLogin("0700000001", "9999");
  assert(false, "wrong PIN should throw");
} catch {
  assert(true, "wrong PIN throws");
}

console.log("Mock OTP — random 6-digit flow");
const phone = "0712345678";
const code1 = mockRequestOtp(phone);
const code2 = mockRequestOtp(phone);
assert(/^\d{6}$/.test(code1), "OTP is 6 digits");
assert(code1 !== code2, "resend generates new OTP");
mockVerifyOtp(phone, code2);
assert(true, "valid OTP verifies");
try {
  mockVerifyOtp(phone, code2);
  assert(false, "used OTP should not verify again");
} catch {
  assert(true, "used OTP rejected");
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

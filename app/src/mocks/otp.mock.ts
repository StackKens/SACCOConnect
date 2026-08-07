const otpByPhone = new Map<string, { code: string; expiresAt: number }>();

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** Simulates POST /api/auth/otp/request — returns code for offline dev display. */
export function mockRequestOtp(phoneNumber: string): string {
  const code = generateCode();
  otpByPhone.set(phoneNumber, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });
  return code;
}

/** Simulates POST /api/auth/otp/verify */
export function mockVerifyOtp(phoneNumber: string, code: string): void {
  const record = otpByPhone.get(phoneNumber);
  if (!record || record.code !== code) {
    throw new Error("Invalid OTP code");
  }
  if (Date.now() > record.expiresAt) {
    otpByPhone.delete(phoneNumber);
    throw new Error("OTP has expired");
  }
  otpByPhone.delete(phoneNumber);
}

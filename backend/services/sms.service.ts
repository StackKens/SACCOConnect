import twilio from "twilio";

let twilioClient: ReturnType<typeof twilio> | null = null;

function getTwilioClient() {
  if (twilioClient) return twilioClient;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  twilioClient = twilio(sid, token);
  return twilioClient;
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function sanitizeLog(input: string): string {
  return input.replace(/[\r\n]/g, " ");
}

export async function sendOTP(phoneNumber: string, otp: string): Promise<void> {
  const client = getTwilioClient();

  if (!client) {
    console.log(`[DEV OTP] Phone: ${sanitizeLog(phoneNumber)} | Code: ${sanitizeLog(otp)}`);
    return;
  }

  await client.messages.create({
    body: `Your SACCOConnect verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to: phoneNumber,
  });
}

export async function sendSMS(phoneNumber: string, message: string): Promise<void> {
  const client = getTwilioClient();

  if (!client) {
    console.log(`[DEV SMS] Phone: ${sanitizeLog(phoneNumber)} | Message: ${sanitizeLog(message)}`);
    return;
  }

  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to: phoneNumber,
  });
}

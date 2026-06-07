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

export async function sendOTP(phoneNumber: string, otp: string): Promise<void> {
  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    console.log(`\n[DEV OTP] Phone: ${phoneNumber} | Code: ${otp}\n`);
    return;
  }

  const client = getTwilioClient();
  if (!client) {
    console.log(`\n[OTP - no Twilio configured] Phone: ${phoneNumber} | Code: ${otp}\n`);
    return;
  }

  await client.messages.create({
    body: `Your SACCOConnect verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to: phoneNumber,
  });
}

export async function sendSMS(phoneNumber: string, message: string): Promise<void> {
  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    console.log(`\n[DEV SMS] Phone: ${phoneNumber} | Message: ${message}\n`);
    return;
  }

  const client = getTwilioClient();
  if (!client) {
    console.log(`\n[SMS - no Twilio configured] Phone: ${phoneNumber} | Message: ${message}\n`);
    return;
  }

  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to: phoneNumber,
  });
}

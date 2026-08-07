import rateLimit from "express-rate-limit";
import type { Request } from "express";

const WINDOW_MS = 15 * 60 * 1000;

function phoneOrIpKey(req: Request): string {
  const body = req.body as Record<string, unknown> | undefined;
  const phone = body?.phoneNumber;
  if (typeof phone === "string" && phone.trim()) {
    return `phone:${phone.trim()}`;
  }
  return `ip:${req.socket?.remoteAddress ?? "unknown"}`;
}

// Backstop against brute force. The DB lockout (5 failures) is the primary
// mechanism; this in-memory limiter (10 failed attempts / 15 min per phone)
// catches cases the DB cannot (e.g. unknown phone numbers).
export const authAttemptLimit = rateLimit({
  windowMs: WINDOW_MS,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => phoneOrIpKey(req),
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Too many failed attempts. Try again in 15 minutes.",
  },
});

// Limits OTP requests per phone number (all requests count, they always succeed).
export const otpRequestLimit = rateLimit({
  windowMs: WINDOW_MS,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => phoneOrIpKey(req),
  message: {
    success: false,
    message: "Too many OTP requests. Try again in 15 minutes.",
  },
});

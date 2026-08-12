type EventChannel = "mobile_app" | "web" | "api" | "admin";

interface EventContext {
  channel?: EventChannel;
  ipAddress?: string;
  deviceId?: string;
  sessionId?: string;
}

interface RiskVerdict {
  event_id: string;
  risk_score: number;
  risk_level: string;
  rules_score: number;
  rules_tier: string;
  model_score: number;
  model_flagged: boolean;
  reasons: string[];
  assessed_at: string;
}

const ENGINE_URL = (process.env.SECURITY_ENGINE_URL || "http://localhost:8000").replace(/\/$/, "");
const TIMEOUT_MS = Number(process.env.SECURITY_ENGINE_TIMEOUT_MS || 2000);

function engineUrl(): string {
  return ENGINE_URL;
}

function newEventId(): string {
  return crypto.randomUUID();
}

function nowIso(): string {
  return new Date().toISOString();
}

function baseEvent(eventType: string, userId: string, ctx: EventContext) {
  return {
    event_id: newEventId(),
    event_type: eventType,
    user_id: userId,
    timestamp: nowIso(),
    channel: ctx.channel ?? "web",
    ip_address: ctx.ipAddress || null,
    device_id: ctx.deviceId || null,
    session_id: ctx.sessionId || null,
  };
}

export function loginEvent(
  userId: string,
  outcome: "success" | "failure",
  ctx: EventContext = {},
  failureReason: "invalid_credentials" | "account_locked" | "mfa_failed" | "other" = "invalid_credentials",
) {
  return {
    ...baseEvent("login", userId, ctx),
    outcome,
    failure_reason: outcome === "failure" ? failureReason : null,
    mfa_required: false,
    mfa_completed: null,
  };
}

export function pinChangeEvent(
  userId: string,
  verification: "password" | "otp_sms" | "session_reauth",
  ctx: EventContext = {},
) {
  return {
    ...baseEvent("pin_change", userId, ctx),
    verification,
  };
}

export function transactionEvent(
  userId: string,
  action: "contribution" | "withdrawal" | "loan_repayment" | "transfer" | "fee",
  amount: number,
  ctx: EventContext = {},
) {
  return {
    ...baseEvent("transaction", userId, ctx),
    action,
    amount,
    currency: "UGX",
    recipient_user_id: null,
  };
}

export async function assessEvent(event: unknown): Promise<RiskVerdict | null> {
  if (process.env.NODE_ENV === "test") return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const response = await fetch(`${engineUrl()}/v1/assess`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(event),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(`[security-intelligence] engine returned ${response.status}: ${detail}`);
      return null;
    }
    const verdict = (await response.json()) as RiskVerdict;
    if (process.env.NODE_ENV !== "test") {
      console.info(
        `[security-intelligence] ${verdict.risk_level} (${verdict.risk_score}) ${verdict.reasons.join("; ")}`,
      );
    }
    return verdict;
  } catch (error) {
    console.warn(
      `[security-intelligence] engine unreachable (${ENGINE_URL}) — continuing without risk intelligence`,
    );
    return null;
  }
}

export async function reportEvent(event: unknown): Promise<void> {
  await assessEvent(event);
}

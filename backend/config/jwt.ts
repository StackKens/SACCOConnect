import jwt from "jsonwebtoken";

const ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

const IS_PROD = process.env.NODE_ENV === "production";
const KNOWN_INSECURE = new Set([
  "dev-access-secret-change-me",
  "dev-refresh-secret-change-me",
]);

function resolveSecret(
  name: string,
  envValue: string | undefined,
  fallback: string,
): string {
  if (envValue) return envValue;
  if (IS_PROD) {
    throw new Error(
      `Missing required env var ${name}. Refusing to start in production with an insecure JWT secret.`,
    );
  }
  return fallback;
}

function ensureStrong(secret: string): void {
  if (IS_PROD && (secret.length < 32 || KNOWN_INSECURE.has(secret))) {
    throw new Error(
      "JWT secrets must be at least 32 characters and not use known dev defaults in production.",
    );
  }
}

const accessSecret = resolveSecret(
  "JWT_ACCESS_SECRET",
  ACCESS_SECRET,
  "dev-access-secret-change-me",
);
const refreshSecret = resolveSecret(
  "JWT_REFRESH_SECRET",
  REFRESH_SECRET,
  "dev-refresh-secret-change-me",
);
ensureStrong(accessSecret);
ensureStrong(refreshSecret);

export interface TokenPayload {
  userId: string;
  role: string;
  saccoId?: string;
}

// Short-lived access tokens (default 1h) to limit exposure if a device/backup
// is stolen. Configurable via JWT_ACCESS_TTL (e.g. "15m", "1h").
const ACCESS_TOKEN_TTL = (process.env.JWT_ACCESS_TTL || "1h") as jwt.SignOptions["expiresIn"];

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, accessSecret, { expiresIn: ACCESS_TOKEN_TTL });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, refreshSecret, { expiresIn: "30d" });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, accessSecret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, refreshSecret) as TokenPayload & {
    iat?: number;
    exp?: number;
  };
  const { iat, exp, ...payload } = decoded;
  return payload;
}

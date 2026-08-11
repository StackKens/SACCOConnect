import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function useSsl(): boolean {
  const raw = process.env.DATABASE_SSL;
  if (raw !== undefined) return raw !== "false" && raw !== "0";
  const url = process.env.DATABASE_URL || "";
  // Local/socket connections don't support SSL; remote hosts (Neon/Railway) do.
  return !(
    url.includes("localhost") ||
    url.includes("127.0.0.1") ||
    url.startsWith("postgresql:///") ||
    url.startsWith("postgres:///")
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: useSsl() ? { rejectUnauthorized: false } : undefined,
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 30000,
  keepAlive: true,
});

pool.on("error", () => {});

export const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

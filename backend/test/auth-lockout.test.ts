import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import { createApp } from "../app";
import { prisma } from "../config/database";
import { clearDatabase, disconnectDb } from "./setup";

const app = createApp();

describe("SEC-06 — failed login lockout and per-phone throttling", () => {
  beforeAll(async () => {
    await clearDatabase();

    const pin = await bcrypt.hash("1234", 12);
    const sacco = await prisma.sacco.create({
      data: {
        name: "Lockout SACCO",
        contributionAmount: 50000,
        interestRate: 12,
        inviteCode: "LOCK1",
      },
    });
    const user = await prisma.user.create({
      data: {
        phoneNumber: "0705555001",
        pinHash: pin,
        role: "MEMBER",
        saccoId: sacco.id,
      },
    });
    await prisma.member.create({
      data: {
        userId: user.id,
        saccoId: sacco.id,
        fullName: "Lockout Member",
        currentBalance: 50000,
      },
    });
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it("increments failed attempts on a wrong PIN and rejects", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ phoneNumber: "0705555001", pin: "0000" });
    expect(res.status).toBe(401);

    const user = await prisma.user.findUnique({
      where: { phoneNumber: "0705555001" },
    });
    expect(user?.failedLoginAttempts).toBe(1);
    expect(user?.lockedUntil).toBeNull();
  });

  it("locks the account after five consecutive failures", async () => {
    for (let i = 0; i < 4; i++) {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ phoneNumber: "0705555001", pin: "0000" });
      expect(res.status).toBe(401);
    }

    const user = await prisma.user.findUnique({
      where: { phoneNumber: "0705555001" },
    });
    expect(user?.failedLoginAttempts).toBe(0);
    expect(user?.lockedUntil).not.toBeNull();
  });

  it("rejects even the correct PIN while locked", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ phoneNumber: "0705555001", pin: "1234" });
    expect(res.status).toBe(429);
    expect(res.body.message).toMatch(/locked/i);
  });

  it("clears the lockout when the lock expires", async () => {
    await prisma.user.update({
      where: { phoneNumber: "0705555001" },
      data: { lockedUntil: new Date(Date.now() - 1000) },
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ phoneNumber: "0705555001", pin: "1234" });
    expect(res.status).toBe(200);

    const user = await prisma.user.findUnique({
      where: { phoneNumber: "0705555001" },
    });
    expect(user?.failedLoginAttempts).toBe(0);
    expect(user?.lockedUntil).toBeNull();
  });

  it("throttles OTP requests per phone number", async () => {
    const phone = "0705555002";
    const otherPhone = "0705555003";

    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post("/api/auth/otp/request")
        .send({ phoneNumber: phone });
      expect(res.status).toBe(200);
    }

    const limited = await request(app)
      .post("/api/auth/otp/request")
      .send({ phoneNumber: phone });
    expect(limited.status).toBe(429);

    // A different phone number is unaffected.
    const ok = await request(app)
      .post("/api/auth/otp/request")
      .send({ phoneNumber: otherPhone });
    expect(ok.status).toBe(200);
  });
});

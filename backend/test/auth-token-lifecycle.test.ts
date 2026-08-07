import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import { createApp } from "../app";
import { prisma } from "../config/database";
import { clearDatabase, disconnectDb } from "./setup";

const app = createApp();

describe("auth token lifecycle — refresh and logout", () => {
  beforeAll(async () => {
    await clearDatabase();

    const pin = await bcrypt.hash("1234", 12);
    const sacco = await prisma.sacco.create({
      data: {
        name: "Lifecycle SACCO",
        contributionAmount: 50000,
        interestRate: 12,
        inviteCode: "LIFE1",
      },
    });
    const user = await prisma.user.create({
      data: {
        phoneNumber: "0701234001",
        pinHash: pin,
        role: "MEMBER",
        saccoId: sacco.id,
      },
    });
    await prisma.member.create({
      data: {
        userId: user.id,
        saccoId: sacco.id,
        fullName: "Lifecycle Member",
        currentBalance: 50000,
      },
    });
  });

  afterAll(async () => {
    await disconnectDb();
  });

  async function login() {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ phoneNumber: "0701234001", pin: "1234" });
    expect(res.status).toBe(200);
    return res.body.data as {
      accessToken: string;
      refreshToken: string;
    };
  }

  it("issues both tokens on login", async () => {
    const tokens = await login();
    expect(tokens.accessToken).toBeTruthy();
    expect(tokens.refreshToken).toBeTruthy();
  });

  it("refreshes a valid access token", async () => {
    const { refreshToken } = await login();

    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ token: refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeTruthy();

    // New access token works on a protected route.
    const protectedRes = await request(app)
      .get("/api/loans/my")
      .set("Authorization", `Bearer ${res.body.data.accessToken}`);
    expect(protectedRes.status).toBe(200);
  });

  it("rejects an unknown or expired refresh token", async () => {
    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ token: "not-a-real-token" });
    expect(res.status).toBe(401);
  });

  it("revokes the refresh token on logout", async () => {
    const { refreshToken } = await login();

    const logoutRes = await request(app)
      .post("/api/auth/logout")
      .send({ token: refreshToken });
    expect(logoutRes.status).toBe(200);

    const refreshRes = await request(app)
      .post("/api/auth/refresh")
      .send({ token: refreshToken });
    expect(refreshRes.status).toBe(401);
  });
});

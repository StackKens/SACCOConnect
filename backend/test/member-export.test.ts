import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import { createApp } from "../app";
import { prisma } from "../config/database";
import { clearDatabase, disconnectDb } from "./setup";

const app = createApp();

describe("admin CSV export endpoint", () => {
  let adminToken = "";
  let memberToken = "";

  beforeAll(async () => {
    await clearDatabase();

    const pin = await bcrypt.hash("1234", 12);
    const sacco = await prisma.sacco.create({
      data: {
        name: "Export SACCO",
        contributionAmount: 50000,
        interestRate: 12,
        inviteCode: "EXP1",
      },
    });
    const adminUser = await prisma.user.create({
      data: { phoneNumber: "0706666001", pinHash: pin, role: "ADMIN", saccoId: sacco.id },
    });
    const adminMember = await prisma.member.create({
      data: { userId: adminUser.id, saccoId: sacco.id, fullName: "Export Admin" },
    });
    await prisma.streak.create({ data: { memberId: adminMember.id, monthlyRecord: "{}" } });

    const memberUser = await prisma.user.create({
      data: { phoneNumber: "0706666002", pinHash: pin, role: "MEMBER", saccoId: sacco.id },
    });
    const member = await prisma.member.create({
      data: {
        userId: memberUser.id,
        saccoId: sacco.id,
        fullName: "Export Member",
        nationalId: "CM9876543",
        currentBalance: 100000,
      },
    });
    await prisma.streak.create({ data: { memberId: member.id, monthlyRecord: "{}" } });

    await prisma.contribution.create({
      data: {
        memberId: member.id,
        amount: 50000,
        method: "MOBILE_MONEY",
        status: "CONFIRMED",
      },
    });
    await prisma.loan.create({
      data: {
        memberId: member.id,
        amountRequested: 200000,
        amountApproved: 200000,
        amountRepaid: 50000,
        purpose: "School fees",
        status: "ACTIVE",
        interestRate: 12,
        repaymentMonths: 6,
        disbursementDate: new Date(),
      },
    });

    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({ phoneNumber: "0706666001", pin: "1234" });
    adminToken = adminLogin.body.data.accessToken;

    const memberLogin = await request(app)
      .post("/api/auth/login")
      .send({ phoneNumber: "0706666002", pin: "1234" });
    memberToken = memberLogin.body.data.accessToken;
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it("returns aggregated members, contributions and loans for the SACCO", async () => {
    const res = await request(app)
      .get("/api/members/export")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const { members, contributions, loans } = res.body.data;
    const member = members.find((m: { name: string }) => m.name === "Export Member");
    expect(member).toBeTruthy();
    expect(member.nationalId).toBe("CM9876543");
    expect(member.savings).toBe(50000);
    expect(member.activeLoan).toBe(150000);

    expect(contributions).toHaveLength(1);
    expect(contributions[0].memberName).toBe("Export Member");
    expect(contributions[0].status).toBe("CONFIRMED");

    expect(loans).toHaveLength(1);
    expect(loans[0].amount).toBe(200000);
    expect(loans[0].purpose).toBe("School fees");
  });

  it("rejects non-admin users", async () => {
    const res = await request(app)
      .get("/api/members/export")
      .set("Authorization", `Bearer ${memberToken}`);
    expect(res.status).toBe(403);
  });

  it("rejects requests without a token", async () => {
    const res = await request(app).get("/api/members/export");
    expect(res.status).toBe(401);
  });
});

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import { createApp } from "../app";
import { prisma } from "../config/database";
import { clearDatabase, disconnectDb } from "./setup";
import { createTenant, auth, Tenant } from "./helpers";

const app = createApp();

describe("sacco payment accounts", () => {
  let tenantA: Tenant;
  let tenantB: Tenant;
  let tenantBAccountId: string;

  beforeAll(async () => {
    await clearDatabase();
    tenantA = await createTenant("Alpha");
    tenantB = await createTenant("Beta");

    const accountB = await prisma.paymentAccount.create({
      data: {
        saccoId: tenantB.sacco.id,
        type: "BANK",
        accountNumber: "2009876543",
        accountName: "Beta SACCO",
        provider: "Example Bank",
      },
    });
    tenantBAccountId = accountB.id;
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it("lets an admin view its own SACCO configuration", async () => {
    const res = await request(app)
      .get("/api/saccos/me")
      .set(auth(tenantA.admin.token));
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(tenantA.sacco.id);
    expect(res.body.data.paymentAccounts).toEqual([]);
  });

  it("lets an admin add a payment account to its own SACCO", async () => {
    const res = await request(app)
      .post("/api/saccos/payment-accounts")
      .set(auth(tenantA.admin.token))
      .send({
        type: "MOBILE_MONEY",
        accountNumber: "0772000123",
        accountName: "Alpha SACCO",
        provider: "MTN",
      });
    expect(res.status).toBe(201);
    expect(res.body.data.saccoId).toBe(tenantA.sacco.id);
    expect(res.body.data.isActive).toBe(true);
    expect(res.body.data.isMemberVisible).toBe(false);
  });

  it("blocks members from adding payment accounts", async () => {
    const res = await request(app)
      .post("/api/saccos/payment-accounts")
      .set(auth(tenantA.member.token))
      .send({
        type: "BANK",
        accountNumber: "1001234567",
        accountName: "Alpha SACCO",
      });
    expect(res.status).toBe(403);
  });

  it("lets an admin toggle visibility and status on its own account", async () => {
    const res = await request(app)
      .patch(`/api/saccos/payment-accounts/${tenantBAccountId}`)
      .set(auth(tenantB.admin.token))
      .send({ isMemberVisible: true, isActive: false });
    expect(res.status).toBe(200);
    expect(res.body.data.isMemberVisible).toBe(true);
    expect(res.body.data.isActive).toBe(false);
  });

  it("blocks tenant A admin from updating tenant B payment account", async () => {
    const res = await request(app)
      .patch(`/api/saccos/payment-accounts/${tenantBAccountId}`)
      .set(auth(tenantA.admin.token))
      .send({ isActive: true });
    expect(res.status).toBe(403);
  });

  it("shows members only active and member-visible accounts", async () => {
    await prisma.paymentAccount.createMany({
      data: [
        {
          saccoId: tenantA.sacco.id,
          type: "BANK",
          accountNumber: "1009998887",
          accountName: "Alpha Hidden",
          isActive: true,
          isMemberVisible: false,
        },
        {
          saccoId: tenantA.sacco.id,
          type: "MOBILE_MONEY",
          accountNumber: "0772000456",
          accountName: "Alpha Visible",
          isMemberVisible: true,
        },
      ],
    });

    const res = await request(app)
      .get("/api/saccos/me")
      .set(auth(tenantA.member.token));
    expect(res.status).toBe(200);
    const accounts = res.body.data.paymentAccounts;
    expect(accounts).toHaveLength(1);
    expect(accounts[0].accountName).toBe("Alpha Visible");
  });
});

describe("admin registration provisions payment account and terms", () => {
  const phoneNumber = "0712" + Math.floor(100000 + Math.random() * 899999);

  beforeAll(async () => {
    await clearDatabase();
    await prisma.otpCode.create({
      data: {
        phoneNumber,
        code: "123456",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        used: true,
      },
    });
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it("rejects registration without terms acceptance", async () => {
    const res = await request(app).post("/api/auth/register/admin").send({
      countryCode: "UG",
      phoneNumber,
      fullName: "New Admin",
      pin: "1234",
      saccoName: "Terms Test SACCO",
      contributionAmount: 50000,
      maxLoanMultiplier: 3,
      interestRate: 12,
      loanTermMonths: 12,
      termsAccepted: false,
      termsVersion: "1",
      paymentAccount: {
        type: "MOBILE_MONEY",
        accountNumber: "0772000999",
        accountName: "Terms Test SACCO",
      },
    });
    expect(res.status).toBe(400);
  });

  it("provisions SACCO, payment account, and terms on registration", async () => {
    const res = await request(app).post("/api/auth/register/admin").send({
      countryCode: "UG",
      phoneNumber,
      fullName: "New Admin",
      nationalId: "CM123456789",
      pin: "1234",
      saccoName: "Terms Test SACCO",
      contributionAmount: 50000,
      maxLoanMultiplier: 3,
      interestRate: 12,
      loanTermMonths: 12,
      meetingDay: "Saturday",
      rulesText: "Rule one\nRule two",
      termsAccepted: true,
      termsVersion: "1",
      paymentAccount: {
        type: "MOBILE_MONEY",
        accountNumber: "0772000999",
        accountName: "Terms Test SACCO",
        provider: "Airtel",
      },
    });

    expect(res.status).toBe(201);
    const sacco = res.body.data.sacco;
    expect(sacco.countryCode).toBe("UG");
    expect(sacco.termsAccepted).toBe(true);
    expect(sacco.termsVersion).toBe("1");
    expect(sacco.paymentAccounts).toHaveLength(1);
    expect(sacco.paymentAccounts[0].accountNumber).toBe("0772000999");
    expect(sacco.paymentAccounts[0].isMemberVisible).toBe(false);
  });

  it("rejects registration with a mismatched country phone", async () => {
    const phone = "070000" + Math.floor(100000 + Math.random() * 899999);
    const res = await request(app).post("/api/auth/register/admin").send({
      countryCode: "RW",
      phoneNumber: phone,
      fullName: "Rwanda Admin",
      pin: "1234",
      saccoName: "Rwanda Test SACCO",
      contributionAmount: 50000,
      maxLoanMultiplier: 3,
      interestRate: 12,
      loanTermMonths: 12,
      termsAccepted: true,
      termsVersion: "1",
      paymentAccount: {
        type: "BANK",
        accountNumber: "1001234567",
        accountName: "Rwanda Test SACCO",
      },
    });
    expect(res.status).toBe(400);
  });
});

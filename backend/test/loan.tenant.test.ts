import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { prisma } from "../config/database";
import { clearDatabase, disconnectDb } from "./setup";
import { createTenant, auth, Tenant } from "./helpers";

const app = createApp();

describe("tenant isolation — loans", () => {
  let tenantA: Tenant;
  let tenantB: Tenant;
  let loanId: string;

  beforeAll(async () => {
    await clearDatabase();
    tenantA = await createTenant("Alpha");
    tenantB = await createTenant("Beta");

    const loan = await prisma.loan.create({
      data: {
        memberId: tenantA.member.memberId,
        amountRequested: 100000,
        purpose: "Test loan",
        status: "UNDER_REVIEW",
        interestRate: 12,
        repaymentMonths: 3,
        totalRepayable: 112000,
      },
    });
    loanId = loan.id;
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it("lets tenant A admin read its own loan", async () => {
    const res = await request(app)
      .get(`/api/loans/${loanId}`)
      .set(auth(tenantA.admin.token));
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(loanId);
  });

  it("blocks tenant B admin from reading tenant A loan", async () => {
    const res = await request(app)
      .get(`/api/loans/${loanId}`)
      .set(auth(tenantB.admin.token));
    expect(res.status).toBe(403);
  });

  it("blocks tenant B member from reading tenant A loan", async () => {
    const res = await request(app)
      .get(`/api/loans/${loanId}`)
      .set(auth(tenantB.member.token));
    expect(res.status).toBe(403);
  });

  it("blocks tenant B admin from approving tenant A loan", async () => {
    const res = await request(app)
      .post(`/api/loans/${loanId}/approve`)
      .set(auth(tenantB.admin.token))
      .send({ amountApproved: 100000, repaymentMonths: 3 });
    expect(res.status).toBe(403);
  });

  it("blocks tenant B admin from rejecting tenant A loan", async () => {
    const res = await request(app)
      .post(`/api/loans/${loanId}/reject`)
      .set(auth(tenantB.admin.token))
      .send({ reason: "Cross-tenant attempt" });
    expect(res.status).toBe(403);
  });

  it("lets tenant A admin approve its own loan", async () => {
    const res = await request(app)
      .post(`/api/loans/${loanId}/approve`)
      .set(auth(tenantA.admin.token))
      .send({ amountApproved: 100000, repaymentMonths: 3 });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("ACTIVE");
  });
});

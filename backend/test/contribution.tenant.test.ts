import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { prisma } from "../config/database";
import { clearDatabase, disconnectDb } from "./setup";
import { createTenant, auth, Tenant } from "./helpers";

const app = createApp();

describe("tenant isolation — contributions", () => {
  let tenantA: Tenant;
  let tenantB: Tenant;
  let contributionBId: string;

  beforeAll(async () => {
    await clearDatabase();
    tenantA = await createTenant("Alpha");
    tenantB = await createTenant("Beta");

    const contribution = await prisma.contribution.create({
      data: {
        memberId: tenantB.member.memberId,
        amount: 50000,
        method: "CASH",
        status: "PENDING",
      },
    });
    contributionBId = contribution.id;
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it("lets tenant A admin credit its own member with cash", async () => {
    const res = await request(app)
      .post("/api/contributions/cash")
      .set(auth(tenantA.admin.token))
      .send({
        memberId: tenantA.member.memberId,
        amount: 50000,
        method: "CASH",
      });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("CONFIRMED");
  });

  it("blocks tenant A admin from crediting tenant B member", async () => {
    const res = await request(app)
      .post("/api/contributions/cash")
      .set(auth(tenantA.admin.token))
      .send({
        memberId: tenantB.member.memberId,
        amount: 50000,
        method: "CASH",
      });
    expect(res.status).toBe(403);
  });

  it("blocks tenant A admin from confirming tenant B contribution", async () => {
    const res = await request(app)
      .post(`/api/contributions/${contributionBId}/confirm`)
      .set(auth(tenantA.admin.token));
    expect(res.status).toBe(403);
  });

  it("lets tenant B admin confirm its own contribution", async () => {
    const res = await request(app)
      .post(`/api/contributions/${contributionBId}/confirm`)
      .set(auth(tenantB.admin.token));
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("CONFIRMED");
  });
});

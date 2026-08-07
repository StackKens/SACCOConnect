import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { prisma } from "../config/database";
import { clearDatabase, disconnectDb } from "./setup";
import { createTenant, auth, Tenant } from "./helpers";

const app = createApp();

describe("tenant isolation — members", () => {
  let tenantA: Tenant;
  let tenantB: Tenant;
  let memberBId: string;

  beforeAll(async () => {
    await clearDatabase();
    tenantA = await createTenant("Alpha");
    tenantB = await createTenant("Beta");
    memberBId = tenantB.member.memberId;
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it("lets tenant A admin read its own member", async () => {
    const res = await request(app)
      .get(`/api/members/${tenantA.member.memberId}`)
      .set(auth(tenantA.admin.token));
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(tenantA.member.memberId);
  });

  it("blocks tenant A admin from reading tenant B member", async () => {
    const res = await request(app)
      .get(`/api/members/${memberBId}`)
      .set(auth(tenantA.admin.token));
    expect(res.status).toBe(403);
  });

  it("blocks tenant A admin from changing tenant B member status", async () => {
    const res = await request(app)
      .patch(`/api/members/${memberBId}/status`)
      .set(auth(tenantA.admin.token))
      .send({ status: "SUSPENDED" });
    expect(res.status).toBe(403);
  });

  it("blocks tenant A admin from deleting tenant B member", async () => {
    const res = await request(app)
      .delete(`/api/members/${memberBId}`)
      .set(auth(tenantA.admin.token));
    expect(res.status).toBe(403);
  });

  it("lets tenant A admin update its own member status", async () => {
    const res = await request(app)
      .patch(`/api/members/${tenantA.member.memberId}/status`)
      .set(auth(tenantA.admin.token))
      .send({ status: "SUSPENDED" });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("SUSPENDED");
  });

  it("lets tenant A admin delete its own member", async () => {
    const res = await request(app)
      .delete(`/api/members/${tenantA.member.memberId}`)
      .set(auth(tenantA.admin.token));
    expect(res.status).toBe(200);
    const gone = await prisma.member.findUnique({
      where: { id: tenantA.member.memberId },
    });
    expect(gone).toBeNull();
  });
});

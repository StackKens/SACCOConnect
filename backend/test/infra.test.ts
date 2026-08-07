import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { clearDatabase, disconnectDb } from "./setup";
import { createTenant, auth } from "./helpers";

const app = createApp();

describe("test infrastructure", () => {
  beforeAll(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it("serves the health endpoint", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("creates two isolated tenants with working tokens", async () => {
    const a = await createTenant("Alpha");
    const b = await createTenant("Beta");

    expect(a.sacco.id).not.toBe(b.sacco.id);

    const resA = await request(app)
      .get("/api/loans/my")
      .set(auth(a.member.token));
    expect(resA.status).toBe(200);
    expect(resA.body.success).toBe(true);

    const resB = await request(app)
      .get("/api/loans/my")
      .set(auth(b.member.token));
    expect(resB.status).toBe(200);
  });
});

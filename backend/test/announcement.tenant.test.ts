import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { prisma } from "../config/database";
import { clearDatabase, disconnectDb } from "./setup";
import { createTenant, auth, Tenant } from "./helpers";

const app = createApp();

describe("tenant isolation — announcements", () => {
  let tenantA: Tenant;
  let tenantB: Tenant;
  let announcementBId: string;

  beforeAll(async () => {
    await clearDatabase();
    tenantA = await createTenant("Alpha");
    tenantB = await createTenant("Beta");

    const announcement = await prisma.announcement.create({
      data: {
        saccoId: tenantB.sacco.id,
        title: "Beta meeting",
        content: "Next meeting Saturday",
        author: "Beta Admin",
      },
    });
    announcementBId = announcement.id;
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it("blocks tenant A admin from deleting tenant B announcement", async () => {
    const res = await request(app)
      .delete(`/api/announcements/${announcementBId}`)
      .set(auth(tenantA.admin.token));
    expect(res.status).toBe(403);
  });

  it("lets tenant B admin delete its own announcement", async () => {
    const res = await request(app)
      .delete(`/api/announcements/${announcementBId}`)
      .set(auth(tenantB.admin.token));
    expect(res.status).toBe(200);
    const gone = await prisma.announcement.findUnique({
      where: { id: announcementBId },
    });
    expect(gone).toBeNull();
  });
});

import bcrypt from "bcryptjs";
import { prisma } from "../config/database";
import { generateAccessToken } from "../config/jwt";

export interface Tenant {
  sacco: { id: string };
  admin: { userId: string; memberId: string; token: string };
  member: { userId: string; memberId: string; token: string };
}

let phoneCounter = 700000100;

export async function createTenant(name: string): Promise<Tenant> {
  const pin = await bcrypt.hash("1234", 12);

  const sacco = await prisma.sacco.create({
    data: {
      name,
      contributionAmount: 50000,
      interestRate: 12,
      inviteCode: `INV${phoneCounter}`,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      phoneNumber: String(phoneCounter++),
      pinHash: pin,
      role: "ADMIN",
      saccoId: sacco.id,
    },
  });
  const adminMember = await prisma.member.create({
    data: {
      userId: adminUser.id,
      saccoId: sacco.id,
      fullName: `${name} Admin`,
      currentBalance: 100000,
    },
  });
  await prisma.streak.create({
    data: { memberId: adminMember.id, monthlyRecord: "{}" },
  });

  const memberUser = await prisma.user.create({
    data: {
      phoneNumber: String(phoneCounter++),
      pinHash: pin,
      role: "MEMBER",
      saccoId: sacco.id,
    },
  });
  const memberMember = await prisma.member.create({
    data: {
      userId: memberUser.id,
      saccoId: sacco.id,
      fullName: `${name} Member`,
      currentBalance: 50000,
    },
  });
  await prisma.streak.create({
    data: { memberId: memberMember.id, monthlyRecord: "{}" },
  });

  const token = (userId: string, role: string) =>
    generateAccessToken({ userId, role, saccoId: sacco.id });

  return {
    sacco: { id: sacco.id },
    admin: {
      userId: adminUser.id,
      memberId: adminMember.id,
      token: token(adminUser.id, "ADMIN"),
    },
    member: {
      userId: memberUser.id,
      memberId: memberMember.id,
      token: token(memberUser.id, "MEMBER"),
    },
  };
}

export function auth(token: string) {
  return { Authorization: `Bearer ${token}` };
}

process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  "postgresql://postgres@127.0.0.1:5432/saccoconnect_test";
process.env.DATABASE_SSL = "false";
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-access-secret-at-least-32-chars-long";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-at-least-32-chars";

import { prisma } from "../config/database";

export async function clearDatabase() {
  await prisma.paymentAccount.deleteMany();
  await prisma.loanRepayment.deleteMany();
  await prisma.guarantor.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.contribution.deleteMany();
  await prisma.streak.deleteMany();
  await prisma.otpCode.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.member.deleteMany();
  await prisma.user.deleteMany();
  await prisma.sacco.deleteMany();
}

export async function disconnectDb() {
  await prisma.$disconnect();
}

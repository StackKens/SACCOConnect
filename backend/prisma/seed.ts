import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.loanRepayment.deleteMany();
  await prisma.guarantor.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.contribution.deleteMany();
  await prisma.streak.deleteMany();
  await prisma.otpCode.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.member.deleteMany();
  await prisma.user.deleteMany();
  await prisma.sacco.deleteMany();

  const pin = await bcrypt.hash("1234", 12);

  // SACCO
  const sacco = await prisma.sacco.create({
    data: {
      name: "Kampala Unity SACCO",
      registrationNo: "SACCO/UG/2021/0042",
      contributionAmount: 50000,
      maxLoanMultiplier: 3,
      interestRate: 12,
      loanTermMonths: 12,
      meetingDay: "Saturday",
      rulesText:
        "1. Monthly contribution of UGX 50,000 due by the 5th\n2. Members must have 3 months of contributions to qualify for a loan\n3. Maximum loan is 3x your savings balance\n4. Late payments attract a 5% penalty\n5. Two guarantors required for any loan above UGX 100,000",
      inviteCode: "UNITY2024",
    },
  });

  // ADMIN USER
  const adminUser = await prisma.user.create({
    data: {
      phoneNumber: "+256700000001",
      pinHash: pin,
      role: "ADMIN",
      saccoId: sacco.id,
    },
  });
  const adminMember = await prisma.member.create({
    data: {
      userId: adminUser.id,
      saccoId: sacco.id,
      fullName: "Daniel Ssekandi",
      nationalId: "CM900123456SSEK",
      currentBalance: 600000,
      joinDate: new Date("2021-03-01"),
    },
  });
  await prisma.streak.create({
    data: {
      memberId: adminMember.id,
      currentStreak: 12,
      longestStreak: 12,
      lastContributionDate: new Date(),
      monthlyRecord: "{}",
    },
  });

  // MEMBER 1
  const user1 = await prisma.user.create({
    data: {
      phoneNumber: "+256700000002",
      pinHash: pin,
      role: "MEMBER",
      saccoId: sacco.id,
    },
  });
  const member1 = await prisma.member.create({
    data: {
      userId: user1.id,
      saccoId: sacco.id,
      fullName: "Alice Wanjiku",
      nationalId: "CM870234567WANJ",
      currentBalance: 350000,
      joinDate: new Date("2022-01-15"),
    },
  });
  await prisma.streak.create({
    data: {
      memberId: member1.id,
      currentStreak: 8,
      longestStreak: 10,
      lastContributionDate: new Date(),
      monthlyRecord: "{}",
    },
  });

  // MEMBER 2
  const user2 = await prisma.user.create({
    data: {
      phoneNumber: "+256700000003",
      pinHash: pin,
      role: "MEMBER",
      saccoId: sacco.id,
    },
  });
  const member2 = await prisma.member.create({
    data: {
      userId: user2.id,
      saccoId: sacco.id,
      fullName: "Bob Omondi",
      nationalId: "CM910345678OMON",
      currentBalance: 220000,
      joinDate: new Date("2022-06-01"),
    },
  });
  await prisma.streak.create({
    data: {
      memberId: member2.id,
      currentStreak: 5,
      longestStreak: 7,
      lastContributionDate: new Date(),
      monthlyRecord: "{}",
    },
  });

  // MEMBER 3
  const user3 = await prisma.user.create({
    data: {
      phoneNumber: "+256700000004",
      pinHash: pin,
      role: "MEMBER",
      saccoId: sacco.id,
    },
  });
  const member3 = await prisma.member.create({
    data: {
      userId: user3.id,
      saccoId: sacco.id,
      fullName: "Catherine Muthoni",
      nationalId: "CM930456789MUTH",
      currentBalance: 480000,
      joinDate: new Date("2021-09-10"),
    },
  });
  await prisma.streak.create({
    data: {
      memberId: member3.id,
      currentStreak: 11,
      longestStreak: 11,
      lastContributionDate: new Date(),
      monthlyRecord: "{}",
    },
  });

  // MEMBER 4 (inactive)
  const user4 = await prisma.user.create({
    data: {
      phoneNumber: "+256700000005",
      pinHash: pin,
      role: "MEMBER",
      saccoId: sacco.id,
    },
  });
  const member4 = await prisma.member.create({
    data: {
      userId: user4.id,
      saccoId: sacco.id,
      fullName: "James Mukasa",
      nationalId: "CM950567890MUKA",
      currentBalance: 100000,
      status: "INACTIVE",
      joinDate: new Date("2023-02-20"),
    },
  });
  await prisma.streak.create({
    data: {
      memberId: member4.id,
      currentStreak: 0,
      longestStreak: 3,
      monthlyRecord: "{}",
    },
  });

  // CONTRIBUTIONS
  const months = [1, 2, 3, 4, 5, 6];
  for (const m of months) {
    for (const member of [member1, member2, member3, adminMember]) {
      await prisma.contribution.create({
        data: {
          memberId: member.id,
          amount: 50000,
          method: m % 2 === 0 ? "MOBILE_MONEY" : "BANK_TRANSFER",
          transactionRef: `TXN-${member.id.slice(-4)}-2025-${String(m).padStart(2, "0")}`,
          status: "CONFIRMED",
          createdAt: new Date(`2025-${String(m).padStart(2, "0")}-05`),
        },
      });
    }
  }
  // Pending contribution for member2
  await prisma.contribution.create({
    data: {
      memberId: member2.id,
      amount: 50000,
      method: "CASH",
      status: "PENDING",
      createdAt: new Date(),
    },
  });

  // ACTIVE LOAN - Alice
  const loan1 = await prisma.loan.create({
    data: {
      memberId: member1.id,
      amountRequested: 300000,
      amountApproved: 300000,
      purpose: "Business expansion — stock purchase",
      status: "ACTIVE",
      interestRate: 12,
      repaymentMonths: 6,
      totalRepayable: 318000,
      amountRepaid: 106000,
      disbursementDate: new Date("2025-01-10"),
      expectedCompletion: new Date("2025-07-10"),
      reviewedBy: adminUser.id,
    },
  });
  // Guarantors for loan1
  await prisma.guarantor.createMany({
    data: [
      {
        loanId: loan1.id,
        guarantorMemberId: member2.id,
        status: "ACCEPTED",
        responseDate: new Date("2025-01-08"),
      },
      {
        loanId: loan1.id,
        guarantorMemberId: member3.id,
        status: "ACCEPTED",
        responseDate: new Date("2025-01-09"),
      },
    ],
  });
  // Repayments
  await prisma.loanRepayment.createMany({
    data: [
      {
        loanId: loan1.id,
        amountPaid: 53000,
        method: "MOBILE_MONEY",
        transactionRef: "RPY-001",
        paymentDate: new Date("2025-02-05"),
      },
      {
        loanId: loan1.id,
        amountPaid: 53000,
        method: "MOBILE_MONEY",
        transactionRef: "RPY-002",
        paymentDate: new Date("2025-03-05"),
      },
    ],
  });

  // REPAID LOAN - Catherine
  const loan2 = await prisma.loan.create({
    data: {
      memberId: member3.id,
      amountRequested: 150000,
      amountApproved: 150000,
      purpose: "School fees",
      status: "REPAID",
      interestRate: 12,
      repaymentMonths: 3,
      totalRepayable: 154500,
      amountRepaid: 154500,
      disbursementDate: new Date("2024-08-01"),
      expectedCompletion: new Date("2024-11-01"),
      reviewedBy: adminUser.id,
    },
  });
  await prisma.guarantor.createMany({
    data: [
      {
        loanId: loan2.id,
        guarantorMemberId: member1.id,
        status: "ACCEPTED",
        responseDate: new Date("2024-07-30"),
      },
      {
        loanId: loan2.id,
        guarantorMemberId: adminMember.id,
        status: "ACCEPTED",
        responseDate: new Date("2024-07-30"),
      },
    ],
  });
  await prisma.loanRepayment.createMany({
    data: [
      {
        loanId: loan2.id,
        amountPaid: 51500,
        method: "BANK_TRANSFER",
        transactionRef: "RPY-003",
        paymentDate: new Date("2024-09-01"),
      },
      {
        loanId: loan2.id,
        amountPaid: 51500,
        method: "BANK_TRANSFER",
        transactionRef: "RPY-004",
        paymentDate: new Date("2024-10-01"),
      },
      {
        loanId: loan2.id,
        amountPaid: 51500,
        method: "BANK_TRANSFER",
        transactionRef: "RPY-005",
        paymentDate: new Date("2024-11-01"),
      },
    ],
  });

  // PENDING LOAN - Bob
  const loan3 = await prisma.loan.create({
    data: {
      memberId: member2.id,
      amountRequested: 200000,
      purpose: "Medical emergency",
      status: "AWAITING_GUARANTORS",
      interestRate: 12,
      repaymentMonths: 4,
      totalRepayable: 208000,
    },
  });
  await prisma.guarantor.createMany({
    data: [
      { loanId: loan3.id, guarantorMemberId: member1.id, status: "PENDING" },
      { loanId: loan3.id, guarantorMemberId: member3.id, status: "PENDING" },
    ],
  });

  console.log("Seed complete!");
  console.log("\nTest credentials (PIN: 1234):");
  console.log("  Admin : +256700000001");
  console.log("  Alice : +256700000002");
  console.log("  Bob   : +256700000003");
  console.log("  Cathy : +256700000004");
  console.log("  Invite code: UNITY2024");
}

main()
  .catch((e) => {
    const msg = e instanceof Error ? e.message.replace(/[\r\n]/g, " ") : String(e);
    console.error(msg);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

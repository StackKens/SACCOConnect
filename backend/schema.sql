-- SACCOConnect PostgreSQL schema (Railway / production)

CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MEMBER', 'LOAN_OFFICER');
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE "ContributionStatus" AS ENUM ('PENDING', 'CONFIRMED');
CREATE TYPE "PaymentMethod" AS ENUM ('MOBILE_MONEY', 'CASH', 'BANK_TRANSFER');
CREATE TYPE "AccountType" AS ENUM ('BANK', 'MOBILE_MONEY');
CREATE TYPE "LoanStatus" AS ENUM (
  'PENDING',
  'AWAITING_GUARANTORS',
  'UNDER_REVIEW',
  'ACTIVE',
  'REPAID',
  'REJECTED'
);
CREATE TYPE "GuarantorStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

CREATE TABLE "Sacco" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "registrationNo" TEXT,
  "contributionAmount" DOUBLE PRECISION NOT NULL,
  "maxLoanMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 3,
  "interestRate" DOUBLE PRECISION NOT NULL,
  "loanTermMonths" INTEGER NOT NULL DEFAULT 12,
  "meetingDay" TEXT,
  "rulesText" TEXT,
  "inviteCode" TEXT NOT NULL,
  "countryCode" TEXT NOT NULL DEFAULT 'UG',
  "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
  "termsVersion" TEXT NOT NULL DEFAULT '1',
  "termsAcceptedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Sacco_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "phoneNumber" TEXT NOT NULL,
  "pinHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL,
  "saccoId" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "User_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "User_saccoId_fkey" FOREIGN KEY ("saccoId") REFERENCES "Sacco"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Member" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "saccoId" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "nationalId" TEXT,
  "photoUrl" TEXT,
  "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
  "currentBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Member_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Member_saccoId_fkey" FOREIGN KEY ("saccoId") REFERENCES "Sacco"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "OtpCode" (
  "id" TEXT NOT NULL,
  "phoneNumber" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "used" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RefreshToken" (
  "id" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Streak" (
  "id" TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  "currentStreak" INTEGER NOT NULL DEFAULT 0,
  "longestStreak" INTEGER NOT NULL DEFAULT 0,
  "lastContributionDate" TIMESTAMP(3),
  "monthlyRecord" JSONB NOT NULL DEFAULT '{}',

  CONSTRAINT "Streak_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Streak_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Contribution" (
  "id" TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "method" "PaymentMethod" NOT NULL,
  "transactionRef" TEXT,
  "recordedBy" TEXT,
  "notes" TEXT,
  "status" "ContributionStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Contribution_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Contribution_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Loan" (
  "id" TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  "amountRequested" DOUBLE PRECISION NOT NULL,
  "amountApproved" DOUBLE PRECISION,
  "purpose" TEXT NOT NULL,
  "status" "LoanStatus" NOT NULL DEFAULT 'PENDING',
  "interestRate" DOUBLE PRECISION NOT NULL,
  "repaymentMonths" INTEGER NOT NULL,
  "totalRepayable" DOUBLE PRECISION,
  "amountRepaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "disbursementDate" TIMESTAMP(3),
  "expectedCompletion" TIMESTAMP(3),
  "rejectionReason" TEXT,
  "reviewedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Loan_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Loan_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Guarantor" (
  "id" TEXT NOT NULL,
  "loanId" TEXT NOT NULL,
  "guarantorMemberId" TEXT NOT NULL,
  "status" "GuarantorStatus" NOT NULL DEFAULT 'PENDING',
  "responseDate" TIMESTAMP(3),

  CONSTRAINT "Guarantor_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Guarantor_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Guarantor_guarantorMemberId_fkey" FOREIGN KEY ("guarantorMemberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "LoanRepayment" (
  "id" TEXT NOT NULL,
  "loanId" TEXT NOT NULL,
  "amountPaid" DOUBLE PRECISION NOT NULL,
  "method" "PaymentMethod" NOT NULL,
  "transactionRef" TEXT,
  "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "LoanRepayment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "LoanRepayment_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Loan"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "PaymentAccount" (
  "id" TEXT NOT NULL,
  "saccoId" TEXT NOT NULL,
  "type" "AccountType" NOT NULL,
  "accountNumber" TEXT NOT NULL,
  "accountName" TEXT NOT NULL,
  "provider" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "isMemberVisible" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PaymentAccount_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PaymentAccount_saccoId_fkey" FOREIGN KEY ("saccoId") REFERENCES "Sacco"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Sacco_inviteCode_key" ON "Sacco"("inviteCode");
CREATE INDEX "PaymentAccount_saccoId_idx" ON "PaymentAccount"("saccoId");
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");
CREATE UNIQUE INDEX "Member_userId_key" ON "Member"("userId");
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");
CREATE UNIQUE INDEX "Streak_memberId_key" ON "Streak"("memberId");
CREATE INDEX "OtpCode_phoneNumber_idx" ON "OtpCode"("phoneNumber");

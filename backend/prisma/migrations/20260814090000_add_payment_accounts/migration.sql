-- AlterTable
ALTER TABLE "Sacco" ADD COLUMN "countryCode" TEXT NOT NULL DEFAULT 'UG',
ADD COLUMN "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "termsVersion" TEXT NOT NULL DEFAULT '1',
ADD COLUMN "termsAcceptedAt" TIMESTAMP(3);

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('BANK', 'MOBILE_MONEY');

-- CreateTable
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

    CONSTRAINT "PaymentAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaymentAccount_saccoId_idx" ON "PaymentAccount"("saccoId");

-- AddForeignKey
ALTER TABLE "PaymentAccount" ADD CONSTRAINT "PaymentAccount_saccoId_fkey" FOREIGN KEY ("saccoId") REFERENCES "Sacco"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('BOG', 'TBC');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'EXPIRED');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'GEL',
ADD COLUMN     "failReason" TEXT,
ADD COLUMN     "months" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "planId" TEXT,
ADD COLUMN     "provider" "PaymentProvider",
ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING';

-- Rows that existed before this module are settled history, not new attempts:
-- the PENDING default is right for new payments but wrong for these.
UPDATE "Payment" SET "status" = 'PAID', "paidAt" = "date" WHERE "paidAt" IS NULL;

-- CreateIndex
-- Postgres treats NULLs as distinct, so pre-existing rows (provider IS NULL)
-- never collide here.
CREATE UNIQUE INDEX "Payment_provider_providerRef_key" ON "Payment"("provider", "providerRef");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;


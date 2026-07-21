-- AlterTable
ALTER TABLE "AiConfig" ADD COLUMN     "allowOrderEdit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "faqText" TEXT,
ADD COLUMN     "leadEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "orderEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT;

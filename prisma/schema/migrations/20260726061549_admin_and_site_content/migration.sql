/*
  Warnings:

  - You are about to drop the column `label` on the `SiteStat` table. All the data in the column will be lost.
  - Added the required column `labelEn` to the `SiteStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `labelKa` to the `SiteStat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SiteStat" DROP COLUMN "label",
ADD COLUMN     "labelEn" TEXT NOT NULL,
ADD COLUMN     "labelKa" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "SiteFaq" (
    "id" TEXT NOT NULL,
    "questionKa" TEXT NOT NULL,
    "questionEn" TEXT NOT NULL,
    "answerKa" TEXT NOT NULL,
    "answerEn" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SiteFaq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "valueKa" TEXT NOT NULL,
    "valueEn" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SiteSetting_key_key" ON "SiteSetting"("key");

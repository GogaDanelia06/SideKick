/*
  Warnings:

  - You are about to drop the `Video` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_businessId_fkey";

-- DropTable
DROP TABLE "Video";

-- CreateTable
CREATE TABLE "Tutorial" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "titleKa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descKa" TEXT NOT NULL DEFAULT '',
    "descEn" TEXT NOT NULL DEFAULT '',
    "youtubeUrl" TEXT NOT NULL,
    "categoryKa" TEXT NOT NULL DEFAULT '',
    "categoryEn" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tutorial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelGuide" (
    "type" "ChannelType" NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "youtubeUrl" TEXT NOT NULL DEFAULT '',
    "bodyKa" TEXT NOT NULL DEFAULT '',
    "bodyEn" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChannelGuide_pkey" PRIMARY KEY ("type")
);

-- CreateIndex
CREATE INDEX "Tutorial_order_idx" ON "Tutorial"("order");

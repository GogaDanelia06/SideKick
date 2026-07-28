-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "extrasEn" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "extrasKa" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "price12m" INTEGER,
ADD COLUMN     "price3m" INTEGER;

-- CreateTable
CREATE TABLE "HeroSlide" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "mediaUrl" TEXT,
    "mediaType" TEXT,
    "mock" TEXT,
    "badgeKa" TEXT NOT NULL DEFAULT '',
    "badgeEn" TEXT NOT NULL DEFAULT '',
    "titleKa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "textKa" TEXT NOT NULL,
    "textEn" TEXT NOT NULL,
    "ctaLabelKa" TEXT NOT NULL DEFAULT '',
    "ctaLabelEn" TEXT NOT NULL DEFAULT '',
    "ctaUrl" TEXT NOT NULL DEFAULT '/pricing',

    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroSlideStat" (
    "id" TEXT NOT NULL,
    "slideId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "labelKa" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "baseValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "changeMin" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "changeMax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "intervalMinMs" INTEGER NOT NULL DEFAULT 2000,
    "intervalMaxMs" INTEGER NOT NULL DEFAULT 6000,
    "suffix" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "HeroSlideStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Benefit" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "icon" TEXT NOT NULL DEFAULT 'IconSparkles',
    "titleKa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descKa" TEXT NOT NULL,
    "descEn" TEXT NOT NULL,

    CONSTRAINT "Benefit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceBox" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "icon" TEXT NOT NULL DEFAULT 'IconSparkles',
    "titleKa" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "bodyKa" TEXT NOT NULL,
    "bodyEn" TEXT NOT NULL,

    CONSTRAINT "ServiceBox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HeroSlide_order_idx" ON "HeroSlide"("order");

-- CreateIndex
CREATE INDEX "HeroSlideStat_slideId_order_idx" ON "HeroSlideStat"("slideId", "order");

-- CreateIndex
CREATE INDEX "Benefit_order_idx" ON "Benefit"("order");

-- CreateIndex
CREATE INDEX "ServiceBox_order_idx" ON "ServiceBox"("order");

-- AddForeignKey
ALTER TABLE "HeroSlideStat" ADD CONSTRAINT "HeroSlideStat_slideId_fkey" FOREIGN KEY ("slideId") REFERENCES "HeroSlide"("id") ON DELETE CASCADE ON UPDATE CASCADE;

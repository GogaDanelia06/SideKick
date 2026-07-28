-- CreateTable
CREATE TABLE "LegalSection" (
    "id" TEXT NOT NULL,
    "doc" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "headingKa" TEXT NOT NULL,
    "headingEn" TEXT NOT NULL,
    "bodyKa" TEXT NOT NULL DEFAULT '',
    "bodyEn" TEXT NOT NULL DEFAULT '',
    "bulletsKa" TEXT NOT NULL DEFAULT '',
    "bulletsEn" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "LegalSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LegalSection_doc_order_idx" ON "LegalSection"("doc", "order");

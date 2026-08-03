-- CreateTable
CREATE TABLE "AnalyticsDaily" (
    "id" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL DEFAULT '',
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AnalyticsDaily_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnalyticsDaily_name_day_idx" ON "AnalyticsDaily"("name", "day");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsDaily_day_name_path_key" ON "AnalyticsDaily"("day", "name", "path");


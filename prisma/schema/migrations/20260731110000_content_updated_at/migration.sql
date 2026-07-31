-- Content tables gain "updatedAt" so the sitemap can report a truthful
-- <lastmod> instead of the build time.
--
-- The DEFAULT stays CURRENT_TIMESTAMP to match what Prisma expects, but it is
-- NOT used to backfill: these columns are TIMESTAMP without time zone, and
-- CURRENT_TIMESTAMP yields a value in the database session's zone. On a server
-- set to Asia/Tbilisi that stores a time four hours ahead of UTC, which Prisma
-- then reads back as UTC — a <lastmod> in the future, which search engines
-- treat as broken. The explicit backfill below is unambiguous.

-- AlterTable
ALTER TABLE "Benefit" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "HeroSlide" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "LegalSection" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ServiceBox" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "SiteFaq" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "SiteStat" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill in real UTC, and repair PageSeo rows created by the previous
-- migration, which used the same default and so carry the same skew.
UPDATE "Benefit"      SET "updatedAt" = (NOW() AT TIME ZONE 'UTC');
UPDATE "HeroSlide"    SET "updatedAt" = (NOW() AT TIME ZONE 'UTC');
UPDATE "LegalSection" SET "updatedAt" = (NOW() AT TIME ZONE 'UTC');
UPDATE "Plan"         SET "updatedAt" = (NOW() AT TIME ZONE 'UTC');
UPDATE "ServiceBox"   SET "updatedAt" = (NOW() AT TIME ZONE 'UTC');
UPDATE "SiteFaq"      SET "updatedAt" = (NOW() AT TIME ZONE 'UTC');
UPDATE "SiteStat"     SET "updatedAt" = (NOW() AT TIME ZONE 'UTC');
UPDATE "PageSeo"      SET "updatedAt" = (NOW() AT TIME ZONE 'UTC')
  WHERE "updatedAt" > (NOW() AT TIME ZONE 'UTC');

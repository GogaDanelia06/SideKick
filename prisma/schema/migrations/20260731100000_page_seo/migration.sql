-- CreateTable
CREATE TABLE "PageSeo" (
    "path" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "canonical" TEXT NOT NULL DEFAULT '',
    "indexable" BOOLEAN NOT NULL DEFAULT true,
    "ogTitle" TEXT NOT NULL DEFAULT '',
    "ogDescription" TEXT NOT NULL DEFAULT '',
    "ogImageUrl" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageSeo_pkey" PRIMARY KEY ("path")
);


-- Carry over the two site-wide values the old SEO screen managed. They only
-- ever described the landing page, so that is where they land. Nothing is
-- inserted when an admin never set them.
INSERT INTO "PageSeo" ("path", "title", "description")
SELECT
  '/',
  COALESCE(MAX(CASE WHEN "key" = 'seo_title'       THEN "valueKa" END), ''),
  COALESCE(MAX(CASE WHEN "key" = 'seo_description' THEN "valueKa" END), '')
FROM "SiteSetting"
WHERE "key" IN ('seo_title', 'seo_description')
HAVING COUNT(*) > 0
ON CONFLICT ("path") DO NOTHING;

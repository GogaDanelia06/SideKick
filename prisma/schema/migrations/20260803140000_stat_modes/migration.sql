-- The stats strip gets the three settings the landing-page spec asks for:
-- a start value, a change-amount range and a change-interval range.
CREATE TYPE "StatMode" AS ENUM ('MANUAL', 'LIVE', 'AUTO');

ALTER TABLE "SiteStat"
  ADD COLUMN "mode"          "StatMode"       NOT NULL DEFAULT 'MANUAL',
  ADD COLUMN "baseValue"     DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "changeMin"     DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "changeMax"     DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "intervalMinMs" INTEGER          NOT NULL DEFAULT 60000,
  ADD COLUMN "intervalMaxMs" INTEGER          NOT NULL DEFAULT 300000,
  ADD COLUMN "suffix"        TEXT             NOT NULL DEFAULT '',
  ADD COLUMN "autoValue"     DOUBLE PRECISION,
  ADD COLUMN "autoNextAt"    TIMESTAMP(3);

-- Rows already pointing at a counter keep counting; everything else stays as
-- typed. Nothing on the public page changes when this runs.
UPDATE "SiteStat" SET "mode" = 'LIVE' WHERE "source" <> '';

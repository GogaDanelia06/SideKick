-- `tokens` was never written by any code, so there is nothing in it to lose.
-- Renamed rather than dropped and re-added anyway: a rename says what happened,
-- and it stays correct if some environment did quietly hold a value.
ALTER TABLE "Channel" RENAME COLUMN "tokens" TO "accessToken";

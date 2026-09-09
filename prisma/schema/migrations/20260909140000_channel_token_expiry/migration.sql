-- Instagram Login tokens last 60 days and nothing renewed them. Storing the
-- expiry is what makes a refresh job possible; without it there is no way to
-- know which channels are about to go quiet.
ALTER TABLE "Channel" ADD COLUMN "tokenExpiresAt" TIMESTAMP(3);

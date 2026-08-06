-- Meta re-sends an event when we miss its five-second deadline. Without a key
-- to recognise the repeat by, the retry lands as a second copy of the same
-- customer message -- and the AI answers it twice.
ALTER TABLE "Message" ADD COLUMN     "externalId" TEXT;

-- Scoped to the conversation, not global, so it holds even if two platforms
-- ever hand us the same id. NULLs repeat, so dashboard and AI messages are fine.
CREATE UNIQUE INDEX "Message_conversationId_externalId_key" ON "Message"("conversationId", "externalId");

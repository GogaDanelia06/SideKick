-- Meta's webhook says which Facebook Page an event happened on and never which
-- business, so this column is what turns an inbound message into a tenant.
ALTER TABLE "Channel" ADD COLUMN     "externalId" TEXT;

-- One page belongs to one tenant: without this, the same page id saved on two
-- accounts would make routing ambiguous and let one tenant quietly capture
-- another's conversations. NULLs repeat freely, so unlinked channels are fine.
CREATE UNIQUE INDEX "Channel_type_externalId_key" ON "Channel"("type", "externalId");

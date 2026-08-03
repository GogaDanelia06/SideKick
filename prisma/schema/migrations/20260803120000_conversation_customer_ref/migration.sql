-- Lets the AI service ask for "the conversation with this customer" and get the
-- same row back on a retry. NULL customerRef rows never collide, so anything
-- created in the dashboard is unaffected.
CREATE UNIQUE INDEX "Conversation_businessId_customerRef_key" ON "Conversation"("businessId", "customerRef");

-- CreateIndex
CREATE INDEX "Conversation_businessId_createdAt_idx" ON "Conversation"("businessId", "createdAt");

-- CreateIndex
CREATE INDEX "Conversation_channelId_idx" ON "Conversation"("channelId");

-- CreateIndex
CREATE INDEX "Faq_businessId_idx" ON "Faq"("businessId");

-- CreateIndex
CREATE INDEX "Lead_businessId_createdAt_idx" ON "Lead"("businessId", "createdAt");

-- CreateIndex
CREATE INDEX "Membership_businessId_idx" ON "Membership"("businessId");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_businessId_createdAt_idx" ON "Order"("businessId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_conversationId_idx" ON "Order"("conversationId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "Payment_businessId_date_idx" ON "Payment"("businessId", "date");

-- CreateIndex
CREATE INDEX "Product_businessId_createdAt_idx" ON "Product"("businessId", "createdAt");

-- CreateIndex
CREATE INDEX "Video_businessId_idx" ON "Video"("businessId");

import type { ConversationDetail, ConversationRow } from "@/lib/dashboard/queries";

export function chatFromRow(row: ConversationRow): ConversationDetail {
  return {
    id: row.id,
    name: row.name,
    initials: row.initials,
    channelType: row.channelType,
    status: row.status,
    aiEnabled: row.aiEnabled,
    handedOver: row.alert === "wait",
    hasLead: row.ring === "lead" || row.ring === "order",
    hasOrder: row.ring === "order",
    messages: [],
  };
}

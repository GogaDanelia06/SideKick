import type { Text } from "@/lib/i18n/messages";

export const MARK = "inline-flex h-8 items-center gap-1.5 rounded-[6px] border px-3 text-xs font-medium";

export const REPLY_NOTICE: Record<string, Text> = {
  window_closed: "dashboard.conversations.chatDetail.savedButMessengerWould",
  failed: "dashboard.conversations.chatDetail.savedButSendingFailed",
  not_delivered: "dashboard.conversations.chatDetail.savedNotSentTo",
  forbidden: "dashboard.conversations.chatDetail.youDoNotHave",
  not_found: "dashboard.conversations.chatDetail.conversationNotFound",
  error: "dashboard.conversations.chatDetail.somethingWentWrongTry",
};

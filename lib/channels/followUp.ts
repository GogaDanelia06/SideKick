import { log } from "@/lib/logger";
import { answerAfterQuietWindow } from "@/lib/ai/quietWindow";
import type { RecordedMessage } from "./inbound";
import { notifyAgent } from "./notify";
import { nameCustomer } from "./profile";

export async function followUp(recorded: RecordedMessage[]): Promise<void> {
  const unnamed = new Set(recorded.filter((r) => r.needsName).map((r) => r.conversationId));

  log.info("naming queue", {
    recorded: recorded.length,
    needName: unnamed.size,
    channels: [...new Set(recorded.map((r) => r.channel))].join(","),
  });

  const naming = (async () => {
    for (const conversationId of unnamed) await nameCustomer(conversationId);
  })();

  const notices = (async () => {
    for (const result of recorded) {
      await notifyAgent({
        event: "message.received",
        businessId: result.businessId,
        conversationId: result.conversationId,
        messageId: result.messageId,
        channel: result.channel,
      });
    }
  })();

  const outcomes = await Promise.allSettled([
    naming,
    notices,
    ...recorded.map((result) =>
      answerAfterQuietWindow(result.businessId, result.conversationId, result.messageId),
    ),
  ]);
  for (const outcome of outcomes) {
    if (outcome.status === "rejected") {
      log.error("messenger webhook follow-up failed", outcome.reason);
    }
  }
}

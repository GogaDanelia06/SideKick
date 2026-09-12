import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import { answerCustomer } from "./answer";

/**
 * Debounces AI replies. Each delivery waits a quiet window, then answers only if it
 * is still the newest message, covering everything the customer said in that turn.
 */

/** Caps the configured delay, which holds a function open. */
const MAX_DELAY_SEC = 120;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function delayFor(businessId: string): Promise<number> {
  const config = await prisma.aiConfig.findUnique({
    where: { businessId },
    select: { replyDelaySec: true },
  });
  const seconds = config?.replyDelaySec ?? 30;
  return Math.min(MAX_DELAY_SEC, Math.max(0, seconds));
}

/** The customer's messages since the last reply, oldest first. */
async function currentTurn(conversationId: string): Promise<{ text: string; newestId: string } | null> {
  const recent = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, sender: true, text: true },
  });

  const run = [];
  for (const m of recent) {
    if (m.sender !== "CUSTOMER") break;
    run.push(m);
  }
  if (run.length === 0) return null;

  return {
    newestId: run[0].id,
    text: run
      .reverse()
      .map((m) => m.text)
      .join("\n"),
  };
}

export async function answerAfterQuietWindow(
  businessId: string,
  conversationId: string,
  messageId: string,
): Promise<void> {
  const seconds = await delayFor(businessId);
  if (seconds > 0) await sleep(seconds * 1000);

  const turn = await currentTurn(conversationId);
  if (!turn) return;

  // A newer message arrived during the window; it owns the reply.
  if (turn.newestId !== messageId) {
    log.info("reply yielded — a newer message arrived during the quiet window", {
      conversationId,
      waitedSec: seconds,
    });
    return;
  }

  await answerCustomer(businessId, conversationId, turn.text);
}

import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import { answerCustomer } from "./answer";

/**
 * Answers a customer once they have finished talking.
 *
 * People do not write one message. They write "hi", then "do you have the 15
 * Pro", then "in blue" — three deliveries, seconds apart. Answering the first
 * meant answering a question that had not been asked yet, and doing it three
 * times: three calls to the model, three replies in the customer's thread, and
 * three messages billed against the merchant's plan for one question.
 *
 * So each delivery waits out a quiet window and then asks one thing: am I still
 * the newest message here? Every invocation but the last answers no and steps
 * aside; the last one answers for all of them, with the whole run of what was
 * said. No queue, no cron, no coordination beyond a fact already in the
 * database — which matters on a plan where a per-minute cron is not available.
 *
 * The cost is a function held open for the length of the window. That is why the
 * window is seconds and not minutes, and why zero is honoured as "answer now".
 */

/** A ceiling, so a mistyped setting cannot hold a function open for an hour. */
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

/**
 * Everything the customer has said since anyone last answered them.
 *
 * Read newest-first and cut at the first message that is not theirs: that is the
 * boundary of the current turn. Joined with newlines rather than spaces, because
 * they were sent as separate thoughts and a model reads them better that way.
 */
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

  // The whole debounce, in one comparison. A message that arrived while this
  // one was waiting owns the reply instead.
  if (turn.newestId !== messageId) {
    log.info("reply yielded — a newer message arrived during the quiet window", {
      conversationId,
      waitedSec: seconds,
    });
    return;
  }

  await answerCustomer(businessId, conversationId, turn.text);
}

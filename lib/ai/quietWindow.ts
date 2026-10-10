import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";
import { answerCustomer } from "./answer";

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

  if (turn.newestId !== messageId) {
    log.info("reply yielded — a newer message arrived during the quiet window", {
      conversationId,
      waitedSec: seconds,
    });
    return;
  }

  await answerCustomer(businessId, conversationId, turn.text);
}

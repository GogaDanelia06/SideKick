import { prisma } from "@/lib/db";
import { log } from "@/lib/logger";

export type LimitRule = {
  max: number;
  windowSec: number;
};

export const LIMITS = {
  login: { max: 5, windowSec: 15 * 60 },
  loginIp: { max: 30, windowSec: 15 * 60 },
  register: { max: 5, windowSec: 60 * 60 },
  forgot: { max: 3, windowSec: 60 * 60 },
  forgotIp: { max: 10, windowSec: 60 * 60 },
  // Same shape as `forgot`, and for the same reason: an endpoint that sends
  // mail to an address a stranger typed is a way to have us deliver unwanted
  // messages on their behalf.
  resend: { max: 3, windowSec: 60 * 60 },
  resendIp: { max: 10, windowSec: 60 * 60 },
  reset: { max: 10, windowSec: 60 * 60 },
  // Per business, not per IP: the AI service calls from its own servers, so
  // every tenant's traffic arrives from the same handful of addresses. Set
  // generously — this is a ceiling for a leaked token or a retry loop gone
  // wrong, not a throttle on normal conversation.
  agent: { max: 600, windowSec: 60 },
} as const satisfies Record<string, LimitRule>;

export type LimitName = keyof typeof LIMITS;

const MAX_WINDOW_SEC = Math.max(...Object.values(LIMITS).map((r) => r.windowSec));

export type LimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
};

const ALLOWED: LimitResult = { ok: true, remaining: 1, retryAfterSec: 0 };

export async function consume(name: LimitName, subject: string): Promise<LimitResult> {
  const rule = LIMITS[name];
  const key = `${name}:${subject.toLowerCase().trim()}`;
  const since = new Date(Date.now() - rule.windowSec * 1000);

  try {
    const hits = await prisma.rateLimitHit.findMany({
      where: { key, createdAt: { gte: since } },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });

    if (hits.length >= rule.max) {
      const oldest = hits[0]!.createdAt.getTime();
      const retryAfterSec = Math.max(
        1,
        Math.ceil((oldest + rule.windowSec * 1000 - Date.now()) / 1000),
      );
      log.warn("rate limit hit", { limit: name, retryAfterSec });
      return { ok: false, remaining: 0, retryAfterSec };
    }

    await prisma.rateLimitHit.create({ data: { key } });
    void sweep();

    return { ok: true, remaining: rule.max - hits.length - 1, retryAfterSec: 0 };
  } catch (err) {
    log.error("rate limiter unavailable", err);
    return ALLOWED;
  }
}

export async function clear(name: LimitName, subject: string): Promise<void> {
  try {
    await prisma.rateLimitHit.deleteMany({
      where: { key: `${name}:${subject.toLowerCase().trim()}` },
    });
  } catch (err) {
    log.error("rate limiter clear failed", err);
  }
}

async function sweep(): Promise<void> {
  if (Math.random() > 0.02) return;
  try {
    await prisma.rateLimitHit.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - MAX_WINDOW_SEC * 1000) } },
    });
  } catch {
  }
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export function tooManyRequestsMessage(retryAfterSec: number): string {
  const minutes = Math.ceil(retryAfterSec / 60);
  return `ძალიან ბევრი მცდელობა. სცადეთ ხელახლა ${minutes} წუთში.`;
}

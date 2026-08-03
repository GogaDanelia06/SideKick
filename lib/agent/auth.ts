import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { log } from "@/lib/logger";

/**
 * Who is allowed to write through /api/agent/*.
 *
 * The AI service is one trusted process serving every tenant, so it holds one
 * shared token and names the business it is acting for on each request. That
 * makes `businessId` the single thing standing between tenants, which is why
 * nothing here trusts it: it is checked against a real Business row on every
 * call, and every write is logged with it.
 *
 * This is deliberately *not* a database grant. A Postgres role has no idea what
 * a tenant is; these handlers do, and they are also where prices get computed,
 * limits get applied, and a bad request becomes a 400 instead of a corrupt row.
 */

export type AgentContext = { businessId: string };

/** A refusal the route handler can return as-is. */
export type AgentDenial = { response: NextResponse };

export function isDenial(v: unknown): v is AgentDenial {
  return typeof v === "object" && v !== null && "response" in v;
}

export function badRequest(message: string): AgentDenial {
  return { response: NextResponse.json({ error: message }, { status: 400 }) };
}

export function notFound(message: string): AgentDenial {
  return { response: NextResponse.json({ error: message }, { status: 404 }) };
}

/** Compares without leaking how much of the token matched. */
function tokenMatches(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  // timingSafeEqual throws on a length mismatch, which would itself be a leak.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function bearer(request: Request): string {
  const header = request.headers.get("authorization") ?? "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

/**
 * Authenticates the caller and resolves which tenant it is acting for.
 *
 * Returns 401 for a bad or missing token and 403 for a `businessId` that does
 * not exist — separate codes because they mean different things to whoever is
 * debugging the integration at 2am.
 */
export async function authenticate(
  request: Request,
  businessId: unknown,
): Promise<AgentContext | AgentDenial> {
  const expected = env().AI_SERVICE_TOKEN;
  if (!expected) {
    // Nothing configured means the integration is not switched on here. Saying
    // so plainly beats a 401 that sends them hunting for a wrong token.
    log.warn("agent API called while AI_SERVICE_TOKEN is unset");
    return { response: NextResponse.json({ error: "agent API is not enabled" }, { status: 503 }) };
  }

  const given = bearer(request);
  if (!given || !tokenMatches(given, expected)) {
    log.warn("agent API rejected a request", { hasToken: given.length > 0 });
    return { response: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }

  if (typeof businessId !== "string" || !businessId) {
    return badRequest("businessId is required");
  }

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true },
  });
  if (!business) {
    log.warn("agent API named an unknown business", { businessId });
    return { response: NextResponse.json({ error: "unknown businessId" }, { status: 403 }) };
  }

  return { businessId: business.id };
}

/** Parses a JSON body without letting a malformed one become a 500. */
export async function readJson(request: Request): Promise<Record<string, unknown> | AgentDenial> {
  try {
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return badRequest("body must be a JSON object");
    }
    return body as Record<string, unknown>;
  } catch {
    return badRequest("body must be valid JSON");
  }
}

/* ── Field readers ────────────────────────────────────────────────────────
   Small and boring on purpose: a wrong type from the caller should become a
   400 with a field name in it, never a Prisma error in our logs.            */

export function str(body: Record<string, unknown>, key: string): string | undefined {
  const v = body[key];
  if (typeof v !== "string") return undefined;
  const trimmed = v.trim();
  return trimmed === "" ? undefined : trimmed;
}

export function requireStr(
  body: Record<string, unknown>,
  key: string,
): string | AgentDenial {
  return str(body, key) ?? badRequest(`${key} is required`);
}

export function int(body: Record<string, unknown>, key: string): number | undefined {
  const v = body[key];
  return typeof v === "number" && Number.isInteger(v) ? v : undefined;
}

/**
 * Narrows a caller-supplied string to one of our enum values.
 *
 * Written as a real check rather than a cast so an unrecognised value comes
 * back as a 400 naming the allowed options, instead of reaching Prisma and
 * failing there with something the AI team cannot act on.
 */
export function oneOf<T extends string>(
  body: Record<string, unknown>,
  key: string,
  allowed: readonly T[],
): T | undefined | AgentDenial {
  const v = str(body, key);
  if (v === undefined) return undefined;
  const upper = v.toUpperCase() as T;
  if (!allowed.includes(upper)) {
    return badRequest(`${key} must be one of: ${allowed.join(", ")}`);
  }
  return upper;
}

export const CHANNEL_TYPES = ["FACEBOOK", "INSTAGRAM", "WHATSAPP", "WEBSITE"] as const;
export const MESSAGE_SENDERS = ["CUSTOMER", "AI", "OPERATOR"] as const;

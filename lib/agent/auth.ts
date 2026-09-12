import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { consume } from "@/lib/security/rateLimit";
import { log } from "@/lib/logger";

/**
 * Authentication for /api/agent/*: one shared token for the AI service, which names
 * the business on each request. The business id is verified on every call.
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

/** Constant-time token comparison. */
function tokenMatches(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function bearer(request: Request): string {
  const header = request.headers.get("authorization") ?? "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

/** 401 for a bad or missing token, 403 for an unknown business. */
export async function authenticate(
  request: Request,
  businessId: unknown,
): Promise<AgentContext | AgentDenial> {
  const expected = env().AI_SERVICE_TOKEN;
  if (!expected) {
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

  // A per-business write ceiling, in case the shared token leaks.
  const limit = await consume("agent", business.id);
  if (!limit.ok) {
    log.warn("agent API rate limited", { businessId: business.id });
    return {
      response: NextResponse.json(
        { error: "rate_limited", retryAfterSec: limit.retryAfterSec },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
      ),
    };
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

// Field readers: a wrong type becomes a 400 naming the field, never a Prisma error.

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

/** Narrows a string to an allowed value, or a 400 listing the options. */
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

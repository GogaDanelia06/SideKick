import { NextResponse } from "next/server";
import type { Bilingual } from "@/lib/content/types";
import { authMessage, tooManyAttempts } from "./messages";

type Init = { status: number; code?: string; headers?: HeadersInit };

/**
 * An auth API refusal. `message` holds both languages for the form; `error` keeps
 * the Georgian text for a page that was loaded before this shape existed.
 */
export function authError(message: Bilingual, { status, code, headers }: Init) {
  return NextResponse.json({ error: message.ka, message, ...(code ? { code } : {}) }, { status, headers });
}

/** The first validation problem; the schemas use AUTH_MESSAGES keys as their messages. */
export function invalidInput(error: { issues: { message: string }[] }) {
  return authError(authMessage(error.issues[0]?.message), { status: 400 });
}

export function throttled(retryAfterSec: number) {
  return authError(tooManyAttempts(retryAfterSec), {
    status: 429,
    headers: { "Retry-After": String(retryAfterSec) },
  });
}

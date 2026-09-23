import { NextResponse } from "next/server";
import { authMessage, tooManyAttempts } from "./messages";
import { textIn, type Text } from "@/lib/i18n/messages";

type Init = { status: number; code?: string; headers?: HeadersInit };

/**
 * An auth API refusal. `message` holds both languages for the form; `error` keeps
 * the Georgian text for a page that was loaded before this shape existed.
 */
export function authError(message: Text, { status, code, headers }: Init) {
  const both = { ka: textIn("ka", message), en: textIn("en", message) };
  return NextResponse.json({ error: both.ka, message: both, ...(code ? { code } : {}) }, { status, headers });
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

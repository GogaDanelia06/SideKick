import { NextResponse } from "next/server";
import { authMessage, tooManyAttempts } from "./messages";
import { textIn, type Text } from "@/lib/i18n/messages";

type Init = { status: number; code?: string; headers?: HeadersInit };

export function authError(message: Text, { status, code, headers }: Init) {
  const both = { ka: textIn("ka", message), en: textIn("en", message) };
  return NextResponse.json({ error: both.ka, message: both, ...(code ? { code } : {}) }, { status, headers });
}

export function invalidInput(error: { issues: { message: string }[] }) {
  return authError(authMessage(error.issues[0]?.message), { status: 400 });
}

export function throttled(retryAfterSec: number) {
  return authError(tooManyAttempts(retryAfterSec), {
    status: 429,
    headers: { "Retry-After": String(retryAfterSec) },
  });
}

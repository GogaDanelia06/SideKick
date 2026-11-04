import { timingSafeEqual } from "node:crypto";

const BEARER = "Bearer ";

export function safeEqual(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function bearerToken(request: Request): string {
  const header = request.headers.get("authorization") ?? "";
  return header.startsWith(BEARER) ? header.slice(BEARER.length).trim() : "";
}

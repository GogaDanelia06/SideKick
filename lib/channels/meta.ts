import { createHmac, timingSafeEqual } from "node:crypto";

export const PLATFORMS = { page: "FACEBOOK", instagram: "INSTAGRAM" } as const;

export type MetaPlatform = keyof typeof PLATFORMS;

export type InboundMessage = {
  pageId: string;
  senderId: string;
  text: string;
  externalId: string;
  platform: MetaPlatform;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function verifySignature(
  rawBody: string,
  header: string | null | undefined,
  ...appSecrets: (string | undefined)[]
): boolean {
  if (!header?.startsWith("sha256=")) return false;

  const given = Buffer.from(header.slice("sha256=".length), "hex");

  let matched = false;
  for (const secret of appSecrets) {
    if (!secret) continue;
    const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest();
    if (given.length === expected.length && timingSafeEqual(given, expected)) matched = true;
  }

  return matched;
}

export function tokensMatch(given: string, expected: string): boolean {
  const a = Buffer.from(given, "utf8");
  const b = Buffer.from(expected, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export function parseMessagingEvents(payload: unknown): InboundMessage[] {
  const out: InboundMessage[] = [];

  if (!isRecord(payload)) return out;

  const platform = typeof payload.object === "string" ? payload.object : "";
  if (!(platform in PLATFORMS)) return out;
  if (!Array.isArray(payload.entry)) return out;

  for (const entry of payload.entry) {
    if (!isRecord(entry)) continue;

    const pageId = str(entry.id);
    if (!pageId) continue;

    for (const event of messagingEvents(entry)) {
      const message = isRecord(event.message) ? event.message : null;
      if (!message || message.is_echo === true) continue;

      const senderId = isRecord(event.sender) ? str(event.sender.id) : null;
      const externalId = str(message.mid);
      const text = str(message.text);

      if (!senderId || !externalId || !text) continue;

      out.push({ pageId, senderId, text, externalId, platform: platform as MetaPlatform });
    }
  }

  return out;
}

function messagingEvents(entry: Record<string, unknown>): Record<string, unknown>[] {
  const events: Record<string, unknown>[] = [];

  if (Array.isArray(entry.messaging)) {
    for (const event of entry.messaging) if (isRecord(event)) events.push(event);
  }

  if (Array.isArray(entry.changes)) {
    for (const change of entry.changes) {
      if (!isRecord(change)) continue;
      if (change.field !== "messages") continue;
      if (isRecord(change.value)) events.push(change.value);
    }
  }

  return events;
}

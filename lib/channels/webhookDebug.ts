/** Redacted webhook traces: the envelope is kept, human-written text becomes its length. */

const MAX_CHARS = 4_000;

/** Fields that carry what people wrote. */
const SECRET_KEYS = new Set(["text", "body", "caption", "title", "subtitle", "payload"]);

function redactValue(value: unknown): unknown {
  if (typeof value === "string") return `‹${value.length} chars›`;
  return "‹redacted›";
}

/** Deep copy with text fields replaced by their length. */
export function redact(value: unknown, depth = 0): unknown {
  if (depth > 8 || value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));

  const out: Record<string, unknown> = {};
  for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
    out[key] = SECRET_KEYS.has(key) ? redactValue(v) : redact(v, depth + 1);
  }
  return out;
}

/** The key skeleton of a payload, without values. */
export function describe(payload: unknown): string {
  if (!payload || typeof payload !== "object") return typeof payload;
  const top = payload as Record<string, unknown>;
  const first = Array.isArray(top.entry) ? top.entry[0] : null;
  const entryKeys =
    first && typeof first === "object" ? Object.keys(first as object).join(",") : "—";

  const events =
    first && typeof first === "object"
      ? ((first as Record<string, unknown>).messaging ?? (first as Record<string, unknown>).changes)
      : null;
  const leaf =
    Array.isArray(events) && events[0] && typeof events[0] === "object"
      ? Object.keys(events[0] as object).join(",")
      : "—";

  return `object=${String(top.object)} entry[0]={${entryKeys}} first={${leaf}}`;
}

export type DeliveryTrace = {
  userAgent: string | null;
  signature: string | null;
  bytes: number;
  body: string;
};

export function traceDelivery(request: Request, raw: string): DeliveryTrace {
  let body: string;
  try {
    body = JSON.stringify(redact(JSON.parse(raw)));
  } catch {
    body = "‹unparseable›";
  }

  return {
    userAgent: request.headers.get("user-agent"),
    signature: request.headers.get("x-hub-signature-256"),
    bytes: raw.length,
    body: body.slice(0, MAX_CHARS),
  };
}

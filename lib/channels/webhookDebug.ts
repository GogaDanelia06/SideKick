/**
 * What a webhook delivery looked like, without what it said.
 *
 * Meta's failures are silent by design: a delivery that was rejected, one whose
 * shape we could not read, and one that was never sent all look identical from
 * the outside. Diagnosing that needs to see the envelope — and a week of this
 * project was spent proving it does **not** need to see the message.
 *
 * Every question that mattered was answered by the structure alone: which
 * `object`, which `entry[].id`, `messaging[]` or `changes[]`, was there a
 * signature. So the text is replaced by its length and everything else is kept
 * verbatim. That is the difference between a tool worth leaving on and one that
 * quietly copies a merchant's inbox into a log aggregator.
 */

/** Long enough for a batch, short enough not to flood a log line. */
const MAX_CHARS = 4_000;

/** Values replaced with a marker rather than printed. */
const SECRET_KEYS = new Set(["text", "body", "caption", "title", "subtitle", "payload"]);

function redactValue(value: unknown): unknown {
  if (typeof value === "string") return `‹${value.length} chars›`;
  return "‹redacted›";
}

/**
 * A deep copy with the human-written parts taken out.
 *
 * Recurses rather than string-replacing so a customer who types the word
 * `"text"` cannot smuggle their message past it, and so nested shapes — a
 * `changes[].value.message.text` — are covered without knowing the path.
 */
export function redact(value: unknown, depth = 0): unknown {
  if (depth > 8 || value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));

  const out: Record<string, unknown> = {};
  for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
    out[key] = SECRET_KEYS.has(key) ? redactValue(v) : redact(v, depth + 1);
  }
  return out;
}

/**
 * The skeleton of a payload: which keys, nothing inside them.
 *
 * Cheap enough to log on every unreadable delivery, which is the point — a
 * shape nobody logged is the reason "Meta is not sending anything" went
 * unchallenged for days.
 */
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

/** The redacted delivery, ready to hand to the logger. */
export function traceDelivery(request: Request, raw: string): DeliveryTrace {
  let body: string;
  try {
    body = JSON.stringify(redact(JSON.parse(raw)));
  } catch {
    // Signed but not JSON. The bytes are not worth printing — if it is not JSON
    // it is not a delivery, and it may be anything at all.
    body = "‹unparseable›";
  }

  return {
    userAgent: request.headers.get("user-agent"),
    signature: request.headers.get("x-hub-signature-256"),
    bytes: raw.length,
    body: body.slice(0, MAX_CHARS),
  };
}

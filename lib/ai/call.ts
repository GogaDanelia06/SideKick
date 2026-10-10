/** The one place that talks HTTP to the AI service: its key, a deadline, and why a call failed. */

const base = () => process.env.AI_SERVICE_URL?.replace(/\/+$/, "");

const key = () => process.env.AI_SERVICE_KEY;

/** Generous for a language model; these calls never run inside the webhook deadline. */
const TIMEOUT_MS = Number(process.env.AI_SERVICE_TIMEOUT_MS ?? 45_000);

/**
 * Writing or rewriting a whole prompt is slower than answering a message: when measured, an
 * edit took 24 to 45 seconds, and one that ran past 45 was cut off and shown as a failure.
 */
export const PROMPT_TIMEOUT_MS = Math.max(TIMEOUT_MS, 90_000);

export function aiConfigured() {
  return Boolean(base() && key());
}

/** What went wrong, told apart so that whoever is testing can see which of these it was. */
export type AiFailureKind =
  | "unconfigured" // no URL or key in this environment
  | "timeout" // no answer within the deadline
  | "unreachable" // the request never reached the service
  | "refused" // the service answered 4xx
  | "server_error" // the service answered 5xx
  | "bad_reply" // answered 200, but not with JSON we can read
  | "empty_reply"; // answered 200, with no text

export type AiFailure = {
  kind: AiFailureKind;
  /** The HTTP status, when the service answered at all. */
  status?: number;
  /** How long the call took, in milliseconds. */
  waitedMs: number;
  /** For the log only: it can hold what the service said, so it never reaches a screen. */
  detail: string;
};

export type Result<T> = { ok: true; data: T } | ({ ok: false } & AiFailure);

export async function call<T>(path: string, body?: unknown, timeoutMs = TIMEOUT_MS): Promise<Result<T>> {
  const url = base();
  const token = key();
  if (!url || !token) {
    return { ok: false, kind: "unconfigured", waitedMs: 0, detail: "AI_SERVICE_URL/AI_SERVICE_KEY not set" };
  }

  const started = Date.now();
  const failed = (kind: AiFailureKind, detail: string, status?: number): Result<never> => ({
    ok: false,
    kind,
    status,
    waitedMs: Date.now() - started,
    detail,
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${url}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body ?? {}),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return failed(res.status >= 500 ? "server_error" : "refused", `HTTP ${res.status}: ${text.slice(0, 300)}`, res.status);
    }

    return { ok: true, data: (await res.json()) as T };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // The deadline can also strike while the body is still arriving, so this checks every throw.
    if (err instanceof Error && err.name === "AbortError") return failed("timeout", message);
    return failed(err instanceof SyntaxError ? "bad_reply" : "unreachable", message);
  } finally {
    clearTimeout(timer);
  }
}

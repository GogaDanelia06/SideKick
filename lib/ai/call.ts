const base = () => process.env.AI_SERVICE_URL?.replace(/\/+$/, "");

const key = () => process.env.AI_SERVICE_KEY;

const TIMEOUT_MS = Number(process.env.AI_SERVICE_TIMEOUT_MS ?? 45_000);

export const PROMPT_TIMEOUT_MS = Math.max(TIMEOUT_MS, 90_000);

export function aiConfigured() {
  return Boolean(base() && key());
}

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
  status?: number;
  waitedMs: number;
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
    if (err instanceof Error && err.name === "AbortError") return failed("timeout", message);
    return failed(err instanceof SyntaxError ? "bad_reply" : "unreachable", message);
  } finally {
    clearTimeout(timer);
  }
}

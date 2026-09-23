import { AI_SAVE_URL, SAVE_ERRORS, type SaveError, type SaveRequest } from "./request";

/** Browsers refuse `keepalive` bodies over 64 KB; a bigger save still goes out, without surviving a closed tab. */
const KEEPALIVE_MAX = 60 * 1024;

export type SaveOutcome = { ok: true } | { ok: false; error: SaveError };

const isSaveError = (value: unknown): value is SaveError => (SAVE_ERRORS as readonly unknown[]).includes(value);

export async function sendSave(request: SaveRequest): Promise<SaveOutcome> {
  const body = JSON.stringify(request);
  try {
    const res = await fetch(AI_SAVE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      credentials: "same-origin",
      // The proxy sends a signed-out user to the login page: a refusal, not something to follow.
      redirect: "manual",
      // Lets the save finish even though the tab is closing.
      keepalive: new Blob([body]).size <= KEEPALIVE_MAX,
    });
    if (res.ok) return { ok: true };
    if (res.type === "opaqueredirect") return { ok: false, error: "signed_out" };

    const data: { error?: unknown } | null = await res.json().catch(() => null);
    return { ok: false, error: isSaveError(data?.error) ? data.error : "failed" };
  } catch {
    return { ok: false, error: "failed" };
  }
}

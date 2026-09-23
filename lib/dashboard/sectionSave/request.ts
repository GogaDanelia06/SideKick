import { DASH } from "@/lib/dashboard/routes";

/** The AI page sections that have a form of their own to save. */
export const SAVE_SECTIONS = ["business", "character", "rules", "prompt"] as const;
export type SectionKey = (typeof SAVE_SECTIONS)[number];

/** Under /dashboard, so the proxy's sign-in and idle checks cover it like the pages. */
export const AI_SAVE_URL = `${DASH.ai}/save`;

/** Who the page was opened for: a save must never land in another account or business. */
export type SectionOwner = { userId: string; businessId: string };

/** A section's whole form, as [name, value] pairs, like the FormData it used to submit. */
export type SaveRequest = SectionOwner & { section: SectionKey; entries: [string, string][] };

export const SAVE_ERRORS = ["forbidden", "signed_out", "moved", "invalid", "failed"] as const;
export type SaveError = (typeof SAVE_ERRORS)[number];

const isPair = (pair: unknown) =>
  Array.isArray(pair) && pair.length === 2 && typeof pair[0] === "string" && typeof pair[1] === "string";

export function isSaveRequest(value: unknown): value is SaveRequest {
  const body = value as Partial<SaveRequest> | null;
  return (
    typeof body?.userId === "string" &&
    typeof body.businessId === "string" &&
    (SAVE_SECTIONS as readonly unknown[]).includes(body.section) &&
    Array.isArray(body.entries) &&
    body.entries.every(isPair)
  );
}

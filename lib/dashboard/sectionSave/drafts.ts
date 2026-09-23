import type { Fields } from "./fields";
import type { SectionOwner, SectionKey } from "./request";

/**
 * Changes the server has not confirmed yet, kept in this browser so a failed or
 * interrupted save loses nothing: they come back the next time the section opens.
 * Kept per user and business, and all cleared on logout.
 */
const PREFIX = "sidekick.ai-draft:";

export type DraftPlace = SectionOwner & { section: SectionKey };
type Draft = { id: number; fields: Fields };

const keyOf = ({ userId, businessId, section }: DraftPlace) => `${PREFIX}${userId}:${businessId}:${section}`;

const isFields = (value: unknown): value is Fields =>
  typeof value === "object" &&
  value !== null &&
  Object.values(value).every((list) => Array.isArray(list) && list.every((v) => typeof v === "string"));

export function readDraft(place: DraftPlace): Draft | null {
  try {
    const draft = JSON.parse(localStorage.getItem(keyOf(place)) ?? "null");
    return typeof draft?.id === "number" && isFields(draft.fields) ? { id: draft.id, fields: draft.fields } : null;
  } catch {
    return null;
  }
}

let lastId = 0;

/** Keeps the changes aside; returns the id `dropDraft` needs. */
export function writeDraft(place: DraftPlace, fields: Fields): number {
  lastId = Math.max(Date.now(), lastId + 1);
  try {
    localStorage.setItem(keyOf(place), JSON.stringify({ id: lastId, fields }));
  } catch {
    // Storage full or blocked: the save still goes out, there is just no copy.
  }
  return lastId;
}

/** Forgets a draft once the server has it; with an id, only if no newer one replaced it. */
export function dropDraft(place: DraftPlace, id?: number) {
  try {
    if (id === undefined || readDraft(place)?.id === id) localStorage.removeItem(keyOf(place));
  } catch {
    // Nothing to clean up in a browser that stores nothing.
  }
}

/** Run on logout, so nothing typed stays behind on a shared computer. */
export function clearAiDrafts() {
  try {
    const keys = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i));
    for (const key of keys) if (key?.startsWith(PREFIX)) localStorage.removeItem(key);
  } catch {
    // As above.
  }
}

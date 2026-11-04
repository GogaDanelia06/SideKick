import { applyFields, changedFields, type Fields } from "./fields";
import type { SectionOwner, SectionKey } from "./request";
import { readStored, storedKeys, writeStored } from "@/lib/browserStorage";

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
    const draft = JSON.parse(readStored(keyOf(place)) ?? "null");
    return typeof draft?.id === "number" && isFields(draft.fields) ? { id: draft.id, fields: draft.fields } : null;
  } catch {
    return null;
  }
}

let lastId = 0;

export function writeDraft(place: DraftPlace, fields: Fields): number {
  lastId = Math.max(Date.now(), lastId + 1);
  writeStored(keyOf(place), JSON.stringify({ id: lastId, fields }));
  return lastId;
}

export function dropDraft(place: DraftPlace, id?: number) {
  if (id === undefined || readDraft(place)?.id === id) writeStored(keyOf(place), null);
}

export function clearAiDrafts() {
  for (const key of storedKeys()) if (key.startsWith(PREFIX)) writeStored(key, null);
}

export function restoreDraft(form: HTMLFormElement, place: DraftPlace, saved: Fields): boolean {
  const draft = readDraft(place);
  if (draft && changedFields(saved, { ...saved, ...draft.fields })) {
    applyFields(form, draft.fields);
    return true;
  }
  if (draft) dropDraft(place);
  return false;
}

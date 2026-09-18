/**
 * The AI sections open right now register how to save themselves, so a business
 * switch or a logout can save them first: both end this page in a way the section
 * would otherwise notice too late.
 */
type Flush = () => Promise<void>;

const open = new Set<Flush>();
let stopped = false;

export function onFlush(flush: Flush): () => void {
  open.add(flush);
  return () => void open.delete(flush);
}

export async function flushAutosave(): Promise<void> {
  await Promise.allSettled([...open].map((flush) => flush()));
}

/** Logging out: whatever the page does next must not save, nor keep a copy. */
export function stopAutosave() {
  stopped = true;
}

export const autosaveStopped = () => stopped;

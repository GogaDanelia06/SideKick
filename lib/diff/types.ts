/** A stretch of an edited line: left as it was, taken out, or put in. */
export type Edit = { text: string; kind: "same" | "removed" | "added" };

/** One line of a comparison between two texts. */
export type DiffRow =
  | { kind: "same"; text: string }
  /** A line that is gone, or one that is new. */
  | { kind: "removed"; text: string }
  | { kind: "added"; text: string }
  /** A line that was changed in places, with the old and the new words side by side. */
  | { kind: "edited"; pieces: Edit[] }
  /** Unchanged lines left out of the view. */
  | { kind: "gap"; count: number };

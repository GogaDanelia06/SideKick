export type Edit = { text: string; kind: "same" | "removed" | "added" };

export type DiffRow =
  | { kind: "same"; text: string }
  | { kind: "removed"; text: string }
  | { kind: "added"; text: string }
  | { kind: "edited"; pieces: Edit[] }
  | { kind: "gap"; count: number };

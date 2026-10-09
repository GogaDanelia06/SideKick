/**
 * Markdown, once parsed: a small tree that the page draws itself (components/ui/Markdown.tsx).
 * Nothing in it is HTML, so whatever the text says — a tag, a script, an image address — can
 * only ever be shown as text, never run.
 */
export type Inline =
  | { kind: "text"; text: string }
  | { kind: "strong" | "em" | "del"; children: Inline[] }
  | { kind: "code"; text: string }
  | { kind: "link"; href: string; children: Inline[] }
  | { kind: "br" };

export type Align = "left" | "center" | "right" | null;

/** `checked` is null for an ordinary item, and true or false for a "- [ ]" task. */
export type ListItem = { checked: boolean | null; children: Block[] };

export type Block =
  | { kind: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; children: Inline[] }
  | { kind: "paragraph"; children: Inline[] }
  | { kind: "list"; ordered: boolean; start: number; items: ListItem[] }
  | { kind: "quote"; children: Block[] }
  | { kind: "code"; text: string }
  | { kind: "rule" }
  | { kind: "table"; align: Align[]; header: Inline[][]; rows: Inline[][][] };

const LINK_SCHEMES = new Set(["http:", "https:", "mailto:", "tel:"]);

/**
 * Where a link may go: the web, an email address or a phone number. `javascript:` and every
 * other scheme give null, and the link is then shown as plain text. The address is read the
 * way a browser reads it, so tabs, spaces and mixed case cannot disguise a scheme.
 */
export function safeHref(href: string): string | null {
  try {
    const url = new URL(href.trim());
    return LINK_SCHEMES.has(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

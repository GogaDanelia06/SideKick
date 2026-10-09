import type { Token, Tokens } from "marked";
import { safeHref, type Inline } from "./nodes";

export const text = (value: string): Inline => ({ kind: "text", text: value });

/** Adds a piece, joining it to the text before it when both are plain text. */
function add(out: Inline[], piece: Inline) {
  const last = out.at(-1);
  if (last?.kind === "text" && piece.kind === "text") last.text += piece.text;
  else out.push(piece);
}

/** The inline parts of a line: emphasis, code, links. Whatever is not understood is kept as text. */
export function inline(tokens: Token[] | undefined): Inline[] {
  const out: Inline[] = [];
  for (const token of tokens ?? []) {
    switch (token.type) {
      case "text":
      case "escape": {
        const t = token as Tokens.Text;
        if (t.tokens?.length) for (const piece of inline(t.tokens)) add(out, piece);
        else add(out, text(t.text));
        break;
      }
      case "strong":
      case "em":
      case "del":
        add(out, { kind: token.type, children: inline((token as Tokens.Strong).tokens) });
        break;
      case "codespan":
        add(out, { kind: "code", text: (token as Tokens.Codespan).text });
        break;
      case "br":
        add(out, { kind: "br" });
        break;
      case "link": {
        const link = token as Tokens.Link;
        const href = safeHref(link.href);
        const children = inline(link.tokens);
        // A link that would be unsafe still shows what it says, just not as a link.
        if (href) add(out, { kind: "link", href, children });
        else for (const piece of children) add(out, piece);
        break;
      }
      case "image": // Never fetched: a prompt is text, and an address in it should not be visited.
        add(out, text((token as Tokens.Image).text));
        break;
      case "html": // `<customer>` in a prompt is a placeholder the author meant to show.
        add(out, text((token as Tokens.HTML).text));
        break;
      case "checkbox":
        break;
      default:
        add(out, text(token.raw ?? ""));
    }
  }
  return out;
}

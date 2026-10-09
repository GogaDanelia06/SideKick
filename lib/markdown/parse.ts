import { Marked, type Token, type Tokens } from "marked";
import { inline, text } from "./inline";
import type { Block, ListItem } from "./nodes";

/**
 * Not the shared `marked` instance. HTML is switched off as a block: by the Markdown rules a
 * line that starts with a tag (`<rules>`) swallows everything below it, unformatted, up to the
 * next blank line — and prompts are often written with such tags. Here a tag is just text.
 */
const markdown = new Marked({ gfm: true, breaks: true, tokenizer: { html: () => undefined } });

function listBlock(token: Tokens.List): Block {
  return {
    kind: "list",
    ordered: token.ordered,
    start: typeof token.start === "number" ? token.start : 1,
    items: token.items.map((item): ListItem => ({
      checked: item.task ? item.checked === true : null,
      children: blocks(item.tokens),
    })),
  };
}

function tableBlock(token: Tokens.Table): Block {
  return {
    kind: "table",
    align: token.align,
    header: token.header.map((cell) => inline(cell.tokens)),
    rows: token.rows.map((row) => row.map((cell) => inline(cell.tokens))),
  };
}

function blocks(tokens: Token[] | undefined): Block[] {
  const out: Block[] = [];
  for (const token of tokens ?? []) {
    switch (token.type) {
      case "heading": {
        const { depth, tokens: content } = token as Tokens.Heading;
        out.push({ kind: "heading", level: Math.min(Math.max(depth, 1), 6) as 1 | 2 | 3 | 4 | 5 | 6, children: inline(content) });
        break;
      }
      case "paragraph":
      case "text": {
        // A list item's own text arrives as a "text" block; either way it is a run of inline parts.
        const children = inline((token as Tokens.Paragraph).tokens ?? [token]);
        if (children.length) out.push({ kind: "paragraph", children });
        break;
      }
      case "list":
        out.push(listBlock(token as Tokens.List));
        break;
      case "blockquote":
        out.push({ kind: "quote", children: blocks((token as Tokens.Blockquote).tokens) });
        break;
      case "code":
        out.push({ kind: "code", text: (token as Tokens.Code).text });
        break;
      case "hr":
        out.push({ kind: "rule" });
        break;
      case "table":
        out.push(tableBlock(token as Tokens.Table));
        break;
      case "html":
        out.push({ kind: "paragraph", children: [text((token as Tokens.HTML).text.trim())] });
        break;
      case "space":
      case "def":
        break;
      default:
        if ("text" in token && typeof token.text === "string" && token.text.trim()) {
          out.push({ kind: "paragraph", children: [text(token.text)] });
        }
    }
  }
  return out;
}

/**
 * Markdown text as blocks. A single line break stays a line break — people write prompts one
 * line at a time — and anything that cannot be read as Markdown comes back as plain text.
 */
export function parseMarkdown(source: string): Block[] {
  if (!source.trim()) return [];
  try {
    return blocks(markdown.lexer(source));
  } catch {
    return [{ kind: "paragraph", children: [text(source)] }];
  }
}

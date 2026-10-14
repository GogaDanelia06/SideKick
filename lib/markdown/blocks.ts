export type Block =
  | { kind: "heading"; level: number; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "quote"; text: string }
  | { kind: "code"; text: string }
  | { kind: "rule" };

const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const RULE = /^\s*([-*_])(\s*\1){2,}\s*$/;
const BULLET = /^\s*[-*•+]\s+(.*)$/;
const NUMBER = /^\s*\d+[.)]\s+(.*)$/;
const QUOTE = /^\s*>\s?(.*)$/;
const FENCE = /^\s*```/;

export function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];

  const flush = () => {
    if (paragraph.length) blocks.push({ kind: "paragraph", text: paragraph.join("\n") });
    paragraph = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (FENCE.test(line)) {
      flush();
      const code: string[] = [];
      while (++i < lines.length && !FENCE.test(lines[i])) code.push(lines[i]);
      blocks.push({ kind: "code", text: code.join("\n") });
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      flush();
      blocks.push({ kind: "heading", level: heading[1].length, text: heading[2] });
      continue;
    }

    if (RULE.test(line)) {
      flush();
      blocks.push({ kind: "rule" });
      continue;
    }

    const item = BULLET.exec(line) ?? NUMBER.exec(line);
    if (item) {
      flush();
      const ordered = !BULLET.test(line);
      const last = blocks[blocks.length - 1];
      if (last?.kind === "list" && last.ordered === ordered) last.items.push(item[1]);
      else blocks.push({ kind: "list", ordered, items: [item[1]] });
      continue;
    }

    const quote = QUOTE.exec(line);
    if (quote) {
      flush();
      const last = blocks[blocks.length - 1];
      if (last?.kind === "quote") last.text += `\n${quote[1]}`;
      else blocks.push({ kind: "quote", text: quote[1] });
      continue;
    }

    if (line.trim() === "") flush();
    else paragraph.push(line);
  }

  flush();
  return blocks;
}

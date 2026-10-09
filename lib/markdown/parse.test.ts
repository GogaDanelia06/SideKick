import { describe, it, expect } from "vitest";
import { safeHref } from "./nodes";
import { parseMarkdown } from "./parse";

const t = (text: string) => ({ kind: "text", text });

/** Gigi's prompt, as the AI team will write it: a heading, a bold name and a list. */
const SAMPLE = [
  "## როლი",
  "შენ ხარ **CoolCat-ის** ზამთრის სათხილამურო ბანაკის მენეჯერი.",
  "",
  "შენი მთავარი ამოცანაა:",
  "- უპასუხო მშობლებისა და დაინტერესებული პირების კითხვებს;",
  "- დაეხმარო შესაბამისი ცვლის შერჩევაში;",
].join("\n");

describe("parseMarkdown()", () => {
  it("shows a heading, bold text and a list as what they are", () => {
    expect(parseMarkdown(SAMPLE)).toEqual([
      { kind: "heading", level: 2, children: [t("როლი")] },
      {
        kind: "paragraph",
        children: [t("შენ ხარ "), { kind: "strong", children: [t("CoolCat-ის")] }, t(" ზამთრის სათხილამურო ბანაკის მენეჯერი.")],
      },
      { kind: "paragraph", children: [t("შენი მთავარი ამოცანაა:")] },
      {
        kind: "list",
        ordered: false,
        start: 1,
        items: [
          { checked: null, children: [{ kind: "paragraph", children: [t("უპასუხო მშობლებისა და დაინტერესებული პირების კითხვებს;")] }] },
          { checked: null, children: [{ kind: "paragraph", children: [t("დაეხმარო შესაბამისი ცვლის შერჩევაში;")] }] },
        ],
      },
    ]);
  });

  it("keeps a single line break, because prompts are written a line at a time", () => {
    expect(parseMarkdown("one\ntwo")).toEqual([{ kind: "paragraph", children: [t("one"), { kind: "br" }, t("two")] }]);
  });

  it("reads nested and numbered lists, and the number a list starts at", () => {
    const [list] = parseMarkdown("3. third\n   - inner\n4. fourth");
    expect(list).toMatchObject({ kind: "list", ordered: true, start: 3 });
    const first = (list as { items: { children: { kind: string }[] }[] }).items[0];
    expect(first.children.map((c) => c.kind)).toEqual(["paragraph", "list"]);
  });

  it("reads tables, quotes, code, rules and task items", () => {
    expect(parseMarkdown("| a | b |\n|---|:-:|\n| 1 | 2 |")[0]).toMatchObject({
      kind: "table",
      align: [null, "center"],
      header: [[t("a")], [t("b")]],
      rows: [[[t("1")], [t("2")]]],
    });
    expect(parseMarkdown("> wise")[0]).toMatchObject({ kind: "quote" });
    expect(parseMarkdown("```\nlet x = 1\n```")).toEqual([{ kind: "code", text: "let x = 1" }]);
    expect(parseMarkdown("---")).toEqual([{ kind: "rule" }]);
    expect(parseMarkdown("- [x] done\n- [ ] todo")[0]).toMatchObject({
      items: [{ checked: true }, { checked: false }],
    });
  });

  it("says nothing for an empty prompt", () => {
    expect(parseMarkdown("")).toEqual([]);
    expect(parseMarkdown("  \n\n ")).toEqual([]);
  });
});

/**
 * A prompt is typed by a merchant and written by an AI, then shown on a page that holds a
 * login. Nothing in it may become markup or a way to run code.
 */
describe("parseMarkdown() and what a prompt may not do", () => {
  it("shows a tag as the text it is, so a <placeholder> survives and a <script> never runs", () => {
    expect(parseMarkdown("Dear <customer>")[0]).toEqual({ kind: "paragraph", children: [t("Dear <customer>")] });
    expect(JSON.stringify(parseMarkdown("<script>alert(1)</script>"))).not.toContain('"kind":"script"');
    expect(parseMarkdown("<div>x</div>")).toEqual([{ kind: "paragraph", children: [t("<div>x</div>")] }]);
  });

  /**
   * By the Markdown rules a line that starts with a tag swallows everything under it, unformatted,
   * up to the next blank line. Prompts are often written with such tags (<rules>, <context>).
   */
  it("keeps formatting what comes after a line that starts with a tag", () => {
    expect(parseMarkdown("<role>\n## Heading\n- **one**\n</role>").map((b) => b.kind)).toEqual(["paragraph", "heading", "list"]);
    const blocks = parseMarkdown("<rules>\n\n- one\n- two\n\n</rules>");
    expect(blocks.map((b) => b.kind)).toEqual(["paragraph", "list", "paragraph"]);
    expect(blocks[0]).toEqual({ kind: "paragraph", children: [t("<rules>")] });
    expect(blocks[2]).toEqual({ kind: "paragraph", children: [t("</rules>")] });
  });

  it("links only to the web, an email address or a phone, and shows any other link as plain text", () => {
    expect(parseMarkdown("[site](https://example.com)")[0]).toEqual({
      kind: "paragraph",
      children: [{ kind: "link", href: "https://example.com/", children: [t("site")] }],
    });
    expect(parseMarkdown("[mail](mailto:a@b.ge)")[0]).toMatchObject({ children: [{ kind: "link", href: "mailto:a@b.ge" }] });
    expect(parseMarkdown("[click](javascript:alert(1))")[0]).toEqual({ kind: "paragraph", children: [t("click")] });
    expect(parseMarkdown("[x](data:text/html;base64,AAAA)")[0]).toEqual({ kind: "paragraph", children: [t("x")] });
  });

  it("never fetches an image, only shows its description", () => {
    expect(parseMarkdown("![a cat](http://tracker.example/pixel.png)")[0]).toEqual({ kind: "paragraph", children: [t("a cat")] });
  });

  it("is not fooled by a scheme dressed up with spaces, tabs or capitals", () => {
    for (const href of [" javascript:alert(1)", "JaVaScRiPt:alert(1)", "java\tscript:alert(1)", "vbscript:x", "//evil.example", "/relative", ""]) {
      expect(safeHref(href), JSON.stringify(href)).toBeNull();
    }
    expect(safeHref(" HTTPS://Example.com/a ")).toBe("https://example.com/a");
    expect(safeHref("tel:+995599999999")).toBe("tel:+995599999999");
  });

  it("keeps symbols as they are, for the page to escape", () => {
    expect(parseMarkdown('a & b < c > "d"')[0]).toEqual({ kind: "paragraph", children: [t('a & b < c > "d"')] });
  });
});

import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Markdown } from "./Markdown";

const html = (source: string) => renderToStaticMarkup(<Markdown source={source} />);

describe("<Markdown>", () => {
  it("draws a heading, bold text and a list, so a prompt reads like a document", () => {
    const out = html("## როლი\nშენ ხარ **CoolCat-ის** მენეჯერი.\n\n- ერთი\n- ორი");
    expect(out).toMatch(/<h2[^>]*>როლი<\/h2>/);
    expect(out).toContain("<strong");
    expect(out).toMatch(/<ul[^>]*><li[^>]*><p[^>]*>ერთი<\/p><\/li>/);
  });

  it("numbers an ordered list from where it starts", () => {
    expect(html("3. third\n4. fourth")).toContain('<ol start="3"');
  });

  it("opens a link in a new tab without handing the page over", () => {
    const out = html("[site](https://example.com)");
    expect(out).toContain('href="https://example.com/"');
    expect(out).toContain('rel="noopener noreferrer nofollow"');
  });

  /** The page holds a login: whatever a prompt contains may only ever be shown, never run. */
  describe("with a prompt that tries to do something", () => {
    it("shows a script as text", () => {
      const out = html("<script>alert(1)</script>");
      expect(out).not.toContain("<script");
      expect(out).toContain("&lt;script&gt;");
    });

    it("shows an image tag with a handler as text, and never draws an image", () => {
      const out = html('<img src=x onerror="alert(1)">\n\n![a cat](http://tracker.example/pixel.png)');
      expect(out).not.toContain("<img");
      expect(out).toContain("&lt;img");
      expect(out).toContain("a cat");
    });

    it("turns a javascript: link into plain text", () => {
      const out = html("[click me](javascript:alert(1))");
      expect(out).not.toContain("javascript:");
      expect(out).not.toContain("<a ");
      expect(out).toContain("click me");
    });

    it("cannot be closed out of its own tags", () => {
      const out = html('**bold</strong><script>alert(1)</script>**');
      expect(out).not.toContain("<script");
    });
  });

  it("keeps a <placeholder> an author wrote, visible, instead of swallowing it as a tag", () => {
    expect(html("Dear <customer>,")).toContain("Dear &lt;customer&gt;,");
  });

  it("draws nothing for nothing", () => {
    expect(html("")).toMatch(/^<div[^>]*><\/div>$/);
  });
});

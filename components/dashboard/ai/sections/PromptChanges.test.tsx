import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { PromptChanges } from "./PromptChanges";

const html = (before: string, after: string) =>
  renderToStaticMarkup(
    <LanguageProvider>
      <PromptChanges before={before} after={after} />
    </LanguageProvider>,
  );

describe("<PromptChanges>", () => {
  it("strikes out an old word and puts the new one after it", () => {
    const out = html("ტონი: პროფესიონალური.", "ტონი: მეგობრული.");
    expect(out).toMatch(/<del[^>]*>პროფესიონალური<\/del>\s*<ins[^>]*>მეგობრული<\/ins>/);
  });

  it("counts the words that came in and the words that went out", () => {
    const out = html("ტონი უნდა იყოს პროფესიონალური.", "ტონი უნდა იყოს მეგობრული და მოკლე.");
    expect(out).toContain("+3");
    expect(out).toContain("−1");
  });

  it("shows a deleted line as removed and a new line as added", () => {
    const out = html("ერთი\nორი\nსამი", "ერთი\nსამი\nოთხი");
    expect(out).toMatch(/<del[^>]*>ორი<\/del>/);
    expect(out).toMatch(/<ins[^>]*>ოთხი<\/ins>/);
  });

  it("folds a long stretch of unchanged lines into one gap", () => {
    const lines = Array.from({ length: 12 }, (_, i) => `ხაზი ${i + 1}`);
    const out = html(lines.join("\n"), [...lines.slice(0, 11), "ახალი ბოლო"].join("\n"));
    expect(out).toContain("უცვლელი ხაზი");
    expect(out).not.toContain("ხაზი 3<");
  });

  it("has nothing to compare when the box was empty", () => {
    expect(html("", "ახალი ტექსტი")).toBe("");
    expect(html("  \n ", "ახალი ტექსტი")).toBe("");
  });

  it("says so when the text is the same as before", () => {
    const out = html("ა ბ გ", "ა ბ გ");
    expect(out).toContain("განსხვავება არ არის");
    expect(out).not.toContain("<del");
  });

  /** The text is whatever the AI wrote: it may be shown, never run. */
  it("shows a tag in the prompt as text", () => {
    const out = html("ა ბ", "ა ბ <script>alert(1)</script>");
    expect(out).not.toContain("<script");
    expect(out).toContain("&lt;script&gt;");
  });
});

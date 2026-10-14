import { describe, it, expect } from "vitest";
import { isSectioned } from "./promptFormat";

describe("isSectioned()", () => {
  it("recognises a prompt split into Markdown sections", () => {
    expect(isSectioned("## როლი\nშენ ხარ ასისტენტი.\n\n## ფასები\n- ბეისიქი 49₾")).toBe(true);
  });

  it("calls a plain or single-heading prompt the old format", () => {
    expect(isSectioned("შენ ხარ Sidekick-ის ასისტენტი. ფასები: 49₾, 99₾.")).toBe(false);
    expect(isSectioned("# Sidekick\nშენ ხარ ასისტენტი.")).toBe(false);
  });

  it("does not count hashes inside a code block", () => {
    expect(isSectioned("```\n## a\n## b\n```")).toBe(false);
  });
});

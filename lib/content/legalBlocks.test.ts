import { describe, it, expect } from "vitest";
import { toBlocks, toItems } from "./legalBlocks";

/** What the client pasted into the admin panel, word joiners and all. */
const PASTED = [
  "მომხმარებელი ვალდებულია Sidekick გამოიყენოს მოქმედი კანონმდებლობის დაცვით.",
  "აკრძალულია Sidekick-ის გამოყენება:",
  "•⁠  ⁠უკანონო საქმიანობისთვის;",
  "•⁠  ⁠სპამის მასობრივი გავრცელებისთვის;",
  "•⁠  ⁠მომსახურების გადაყიდვისთვის.",
  "მომხმარებელი პასუხისმგებელია გავრცელებულ შინაარსზე.",
].join("\n");

describe("toBlocks()", () => {
  it("reads a pasted list as a list, and the lines around it as paragraphs", () => {
    expect(toBlocks(PASTED)).toEqual([
      {
        kind: "text",
        text: "მომხმარებელი ვალდებულია Sidekick გამოიყენოს მოქმედი კანონმდებლობის დაცვით.\nაკრძალულია Sidekick-ის გამოყენება:",
      },
      {
        kind: "list",
        items: [
          "უკანონო საქმიანობისთვის;",
          "სპამის მასობრივი გავრცელებისთვის;",
          "მომსახურების გადაყიდვისთვის.",
        ],
      },
      { kind: "text", text: "მომხმარებელი პასუხისმგებელია გავრცელებულ შინაარსზე." },
    ]);
  });

  it("takes a bullet however it was typed, and never a word that merely starts with one", () => {
    const written = toBlocks("- one\n* two\n• three\n– four\n-notalist\n5 - 3 = 2");
    expect(written[0]).toEqual({ kind: "list", items: ["one", "two", "three", "four"] });
    expect(written[1]).toEqual({ kind: "text", text: "-notalist\n5 - 3 = 2" });
  });

  it("starts a new paragraph at a blank line and drops an empty bullet", () => {
    expect(toBlocks("one\n\n  \ntwo\n•   \n• three")).toEqual([
      { kind: "text", text: "one" },
      { kind: "text", text: "two" },
      { kind: "list", items: ["three"] },
    ]);
  });

  it("has nothing to say about an empty box", () => {
    expect(toBlocks("")).toEqual([]);
    expect(toItems(" \n\n ")).toEqual([]);
  });
});

import { describe, it, expect } from "vitest";
import { draftedBlocks, pairBlocks, pairItems, toBlocks, toItems } from "./legalBlocks";

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

describe("pairBlocks()", () => {
  it("matches the two languages block by block", () => {
    const blocks = pairBlocks("ერთი\n\n• ორი", "One\n\n• Two");
    expect(blocks).toEqual([
      { kind: "text", text: { ka: "ერთი", en: "One" } },
      { kind: "list", items: [{ ka: "ორი", en: "Two" }] },
    ]);
  });

  it("falls back to the Georgian wherever the English has not been written", () => {
    expect(pairBlocks("ერთი\n\n• ორი\n• სამი", "One")).toEqual([
      { kind: "text", text: { ka: "ერთი", en: "One" } },
      { kind: "list", items: [{ ka: "ორი", en: "ორი" }, { ka: "სამი", en: "სამი" }] },
    ]);
  });

  it("does not mistake an English paragraph for the Georgian list beside it", () => {
    expect(pairBlocks("• ორი", "a paragraph")).toEqual([
      { kind: "list", items: [{ ka: "ორი", en: "ორი" }] },
    ]);
  });
});

describe("the boxes that came before", () => {
  it("drops a bullet typed into the box that draws its own", () => {
    expect(toItems("• ერთი\n- ორი\nსამი")).toEqual(["ერთი", "ორი", "სამი"]);
  });

  it("still turns the separate bullets box into a list", () => {
    expect(pairItems("ერთი\nორი", "One")).toEqual([
      { kind: "list", items: [{ ka: "ერთი", en: "One" }, { ka: "ორი", en: "ორი" }] },
    ]);
    expect(pairItems("", "")).toEqual([]);
  });

  it("lays the drafted copy out the same way, bullets last", () => {
    const ka = (text: string) => ({ ka: text, en: text });
    expect(draftedBlocks({ paragraphs: [ka("one")], bullets: [ka("two")] })).toEqual([
      { kind: "text", text: ka("one") },
      { kind: "list", items: [ka("two")] },
    ]);
    expect(draftedBlocks({ paragraphs: [ka("only")] })).toEqual([{ kind: "text", text: ka("only") }]);
  });
});

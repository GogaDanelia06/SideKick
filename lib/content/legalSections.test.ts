import { describe, it, expect } from "vitest";
import { draftedBlocks, pairSection, readsInEnglish, type StoredSection } from "./legalSections";

const both = (text: string) => ({ ka: text, en: text });

const section = (over: Partial<StoredSection> = {}): StoredSection => ({
  headingKa: "4. მიზნები",
  headingEn: "4. Purposes",
  bodyKa: "ერთი\n\n• ორი\n• სამი",
  bodyEn: "One\n\n• Two\n• Three",
  bulletsKa: "",
  bulletsEn: "",
  ...over,
});

describe("pairSection()", () => {
  it("matches the two languages block by block when the section was fully translated", () => {
    expect(pairSection(section())).toEqual({
      heading: { ka: "4. მიზნები", en: "4. Purposes" },
      blocks: [
        { kind: "text", text: { ka: "ერთი", en: "One" } },
        { kind: "list", items: [{ ka: "ორი", en: "Two" }, { ka: "სამი", en: "Three" }] },
      ],
    });
  });

  it("shows the whole section in Georgian when the English stops short", () => {
    expect(pairSection(section({ bodyEn: "One" }))).toEqual({
      heading: both("4. მიზნები"),
      blocks: [{ kind: "text", text: both("ერთი") }, { kind: "list", items: [both("ორი"), both("სამი")] }],
    });
  });

  it("counts a list with a missing item, and a heading with no English, as stopping short", () => {
    expect(pairSection(section({ bodyEn: "One\n\n• Two" })).heading).toEqual(both("4. მიზნები"));
    expect(pairSection(section({ headingEn: " " })).heading).toEqual(both("4. მიზნები"));
  });

  it("adds the bullets box as a list after the text", () => {
    const rows = pairSection(section({ bodyKa: "ერთი", bodyEn: "One", bulletsKa: "ორი", bulletsEn: "Two" }));
    expect(rows.blocks).toEqual([
      { kind: "text", text: { ka: "ერთი", en: "One" } },
      { kind: "list", items: [{ ka: "ორი", en: "Two" }] },
    ]);
  });

  it("will not read an English paragraph as the Georgian list beside it", () => {
    const rows = pairSection(section({ bodyKa: "• ორი", bodyEn: "a paragraph" }));
    expect(rows.blocks).toEqual([{ kind: "list", items: [both("ორი")] }]);
  });
});

describe("readsInEnglish()", () => {
  it("says yes only when heading, text and every bullet have their English", () => {
    expect(readsInEnglish(section())).toBe(true);
    expect(readsInEnglish(section({ bodyEn: "" }))).toBe(false);
    expect(readsInEnglish(section({ bodyEn: "One\n\n• Two\n• Three\n• Four" }))).toBe(false);
    expect(readsInEnglish(section({ bulletsKa: "ა" }))).toBe(false);
    expect(readsInEnglish(section({ headingEn: "" }))).toBe(false);
  });
});

describe("draftedBlocks()", () => {
  it("lays the drafted copy out the same way, bullets last", () => {
    expect(draftedBlocks({ paragraphs: [both("one")], bullets: [both("two")] })).toEqual([
      { kind: "text", text: both("one") },
      { kind: "list", items: [both("two")] },
    ]);
    expect(draftedBlocks({ paragraphs: [both("only")] })).toEqual([{ kind: "text", text: both("only") }]);
  });
});

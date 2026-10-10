import { describe, it, expect } from "vitest";
import { commonRun } from "./lcs";
import { countChanges, diffText, foldUnchanged, hasChanges, type DiffRow } from ".";

/** A comparison as text: − removed line, + added line, ± edited line with [−old] and [+new] words. */
function show(rows: DiffRow[]): string[] {
  return rows.map((row) => {
    if (row.kind === "same") return `  ${row.text}`;
    if (row.kind === "gap") return `… ${row.count}`;
    if (row.kind === "removed") return `− ${row.text}`;
    if (row.kind === "added") return `+ ${row.text}`;
    const words = row.pieces.map((p) => (p.kind === "same" ? p.text : `[${p.kind === "added" ? "+" : "−"}${p.text}]`));
    return `± ${words.join("")}`;
  });
}

const lines = (count: number) => Array.from({ length: count }, (_, i) => `ხაზი ${i + 1}`).join("\n");

describe("commonRun()", () => {
  it("pairs up what two lists share, in order", () => {
    expect(commonRun([..."abcde"], [..."abxde"])).toEqual([[0, 0], [1, 1], [3, 3], [4, 4]]);
    expect(commonRun([..."axbyc"], [..."abc"])).toEqual([[0, 0], [2, 1], [4, 2]]);
  });

  it("gives up on two long lists with nothing in common, instead of hanging", () => {
    const many = (prefix: string) => Array.from({ length: 1200 }, (_, i) => `${prefix}${i}`);
    expect(commonRun(many("a"), many("b"))).toEqual([]);
  });
});

describe("diffText()", () => {
  it("shows an edited line once, with the old word and the new word side by side", () => {
    expect(show(diffText("ერთი\nუპასუხე ზუსტად.\nბოლო", "ერთი\nუპასუხე მოკლედ.\nბოლო"))).toEqual([
      "  ერთი",
      "± უპასუხე [−ზუსტად][+მოკლედ].",
      "  ბოლო",
    ]);
  });

  it("shows words put into a line as added, and leaves the rest of the line alone", () => {
    expect(show(diffText("უპასუხე ზუსტად.", "უპასუხე ზუსტად და მოკლედ."))).toEqual(["± უპასუხე ზუსტად[+ და მოკლედ]."]);
  });

  it("reads a replaced phrase as one change, not one per word", () => {
    expect(show(diffText("ა ბ გ დ", "ა ე ვ დ"))).toEqual(["± ა [−ბ გ][+ე ვ] დ"]);
  });

  it("shows a new line as added and a deleted line as removed", () => {
    expect(show(diffText("ა\nბ", "ა\nბ\nგ"))).toEqual(["  ა", "  ბ", "+ გ"]);
    expect(show(diffText("ა\nბ\nგ", "ა\nგ"))).toEqual(["  ა", "− ბ", "  გ"]);
  });

  it("matches an edited line with its new version, not with whatever sits at the same place", () => {
    expect(show(diffText("ახალი ამბავი\nფასი 10 ლარი", "ფასი 12 ლარი"))).toEqual(["− ახალი ამბავი", "± ფასი [−10][+12] ლარი"]);
  });

  it("does not join lines that have almost no words in common", () => {
    expect(show(diffText("ერთი ორი სამი", "ხუთი ექვსი შვიდი"))).toEqual(["− ერთი ორი სამი", "+ ხუთი ექვსი შვიდი"]);
  });

  it("loses nothing: the old line and the new line can both be read back from an edited one", () => {
    const samples = [
      ["ფასი: 10 ლარი, ბილეთი უფასოა.", "ფასი: 12 ლარი, ბილეთი უფასოა!"],
      ["Reply in English or Русский.", "Reply in Georgian or Русский, politely."],
      ["  - ერთი ორი სამი", "  - ერთი ახალი სამი ოთხი"],
    ];
    for (const [before, after] of samples) {
      const [row] = diffText(before, after);
      if (row.kind !== "edited") throw new Error(`not paired: ${before}`);
      expect(row.pieces.filter((p) => p.kind !== "added").map((p) => p.text).join("")).toBe(before);
      expect(row.pieces.filter((p) => p.kind !== "removed").map((p) => p.text).join("")).toBe(after);
    }
  });

  it("shows everything as added from an empty text, and as removed to one", () => {
    expect(show(diffText("", "ა\nბ"))).toEqual(["+ ა", "+ ბ"]);
    expect(show(diffText("ა", ""))).toEqual(["− ა"]);
  });

  it("keeps an empty line a change worth showing", () => {
    expect(show(diffText("ა\n\nბ", "ა\nბ"))).toEqual(["  ა", "− ", "  ბ"]);
  });

  it("sees no change in line endings, trailing spaces or a final newline", () => {
    expect(hasChanges(diffText("ა\r\nბ  \n", "ა\nბ"))).toBe(false);
  });

  it("copes with two long texts that differ everywhere", () => {
    const rows = diffText(lines(1200), lines(1200).replaceAll("ხაზი", "სტრიქონი"));
    expect(hasChanges(rows)).toBe(true);
    expect(rows).toHaveLength(2400);
  });
});

describe("foldUnchanged()", () => {
  it("keeps a line of context around a change and folds the rest into gaps", () => {
    const rows = diffText(lines(10), lines(10).replace("ხაზი 5", "ხაზი ხუთი"));
    expect(show(foldUnchanged(rows))).toEqual(["… 3", "  ხაზი 4", "± ხაზი [−5][+ხუთი]", "  ხაზი 6", "… 4"]);
  });

  it("shows a single line rather than a gap that hides only one", () => {
    const rows = diffText(lines(6), lines(6).replace("ხაზი 4", "ხაზი ოთხი"));
    expect(show(foldUnchanged(rows)).slice(-2)).toEqual(["  ხაზი 5", "  ხაზი 6"]);
  });
});

describe("countChanges()", () => {
  it("counts the words added and the words removed", () => {
    expect(countChanges(diffText("ა ბ გ", "ა დ გ ე"))).toEqual({ added: 2, removed: 1 });
    expect(countChanges(diffText("ა ბ\nგ დ", "ა ბ"))).toEqual({ added: 0, removed: 2 });
    expect(countChanges(diffText("ა", "ა"))).toEqual({ added: 0, removed: 0 });
  });
});

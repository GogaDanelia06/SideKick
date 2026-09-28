import type { Bilingual } from "./types";
import { toBlocks, toItems, type LegalBlock, type LegalSectionView, type RawBlock } from "./legalBlocks";

/** A section as the admin panel stores it: one column per language. */
export type StoredSection = {
  headingKa: string;
  headingEn: string;
  bodyKa: string;
  bodyEn: string;
  bulletsKa: string;
  bulletsEn: string;
};

const pairUp = (ka: string[], en: string[]): Bilingual[] =>
  ka.map((text, i) => ({ ka: text, en: en[i] ?? text }));

/** Whether the English was written as a translation of the Georgian: block for block, item for item. */
function alike(georgian: RawBlock[], english: RawBlock[]): boolean {
  return (
    georgian.length === english.length &&
    georgian.every((block, i) => {
      const other = english[i];
      if (block.kind !== other.kind) return false;
      return block.kind === "text" || block.items.length === (other as { items: string[] }).items.length;
    })
  );
}

/**
 * Whether this section is written in English as fully as in Georgian — heading, text and
 * every bullet. The admin panel shows this beside each section, because the rule below
 * decides what the public page does with it.
 */
export function readsInEnglish(section: StoredSection): boolean {
  return (
    section.headingEn.trim() !== "" &&
    alike(toBlocks(section.bodyKa), toBlocks(section.bodyEn)) &&
    toItems(section.bulletsKa).length === toItems(section.bulletsEn).length
  );
}

/**
 * One section in both languages.
 *
 * A section is shown in English only when all of it was written in English: half a section
 * in one language and half in the other reads as broken, and on a legal page that matters.
 * Anything short of that shows in Georgian, and the panel says which sections those are.
 */
export function pairSection(section: StoredSection): LegalSectionView {
  const english = readsInEnglish(section);
  const georgian = toBlocks(section.bodyKa);
  const translated = english ? toBlocks(section.bodyEn) : [];

  const blocks = georgian.map((block, i): LegalBlock => {
    const other = translated[i];
    if (block.kind === "list") {
      return { kind: "list", items: pairUp(block.items, other?.kind === "list" ? other.items : []) };
    }
    return { kind: "text", text: { ka: block.text, en: other?.kind === "text" ? other.text : block.text } };
  });

  // The bullets box, where a section still uses it, is a list after the text.
  const items = toItems(section.bulletsKa);
  if (items.length > 0) {
    blocks.push({ kind: "list", items: pairUp(items, english ? toItems(section.bulletsEn) : []) });
  }

  return {
    heading: { ka: section.headingKa, en: english ? section.headingEn : section.headingKa },
    blocks,
  };
}

/** The drafted copy (lib/content/legal.ts) already knows its shape; this is it as blocks. */
export function draftedBlocks(section: { paragraphs?: Bilingual[]; bullets?: Bilingual[] }): LegalBlock[] {
  const paragraphs = (section.paragraphs ?? []).map((text): LegalBlock => ({ kind: "text", text }));
  const bullets = section.bullets ?? [];
  return bullets.length > 0 ? [...paragraphs, { kind: "list", items: bullets }] : paragraphs;
}

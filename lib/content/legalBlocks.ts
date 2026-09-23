import type { Bilingual } from "./types";

/**
 * What a legal section is made of, read from the plain text the admin panel saves.
 *
 * The panel has one box per language, and whoever fills it pastes from Word, a chat or
 * a lawyer's letter. So the text itself says what it is: a blank line starts a new
 * paragraph, and a line that opens with a bullet — •, -, * and friends — is an item in
 * a list. Everything else stays as written, line breaks included.
 */
export type LegalBlock =
  | { kind: "text"; text: Bilingual }
  | { kind: "list"; items: Bilingual[] };

/** A section of a legal document as the page renders it. */
export type LegalSectionView = { heading: Bilingual; blocks: LegalBlock[] };

type RawBlock = { kind: "text"; text: string } | { kind: "list"; items: string[] };

/** Characters that carry no meaning but travel with text pasted from chat apps and Word. */
const INVISIBLE = /[­​-‏⁠﻿]/g;

/** A line that opens a list item: a bullet of some kind, then a space — or nothing at all. */
const BULLET = /^[•‣▪◦·*+–—-](?:\s+|$)/;

const clean = (line: string) => line.replace(INVISIBLE, "").replace(/ /g, " ").trim();

/** The blocks one language's text is made of, in the order it was written. */
export function toBlocks(body: string): RawBlock[] {
  const blocks: RawBlock[] = [];
  let paragraph: string[] = [];

  const endParagraph = () => {
    if (paragraph.length > 0) blocks.push({ kind: "text", text: paragraph.join("\n") });
    paragraph = [];
  };

  for (const raw of body.split(/\r?\n/)) {
    const line = clean(raw);
    if (!line) {
      endParagraph();
      continue;
    }

    const marker = BULLET.exec(line);
    if (!marker) {
      paragraph.push(line);
      continue;
    }

    const item = line.slice(marker[0].length).trim();
    if (!item) continue;
    endParagraph();
    const open = blocks.at(-1);
    if (open?.kind === "list") open.items.push(item);
    else blocks.push({ kind: "list", items: [item] });
  }

  endParagraph();
  return blocks;
}

/** One line per item, however it is written: what the separate bullets box holds. */
export const toItems = (text: string) =>
  text
    .split(/\r?\n/)
    .map(clean)
    // A bullet typed into a box that draws its own would show twice.
    .map((line) => line.replace(BULLET, ""))
    .filter(Boolean);

const pairUp = (ka: string[], en: string[]): Bilingual[] =>
  ka.map((text, i) => ({ ka: text, en: en[i] ?? text }));

/**
 * The same section in both languages. They are matched block by block, and any block the
 * English is missing falls back to the Georgian — a half-translated page still reads.
 */
export function pairBlocks(ka: string, en: string): LegalBlock[] {
  const english = toBlocks(en);

  return toBlocks(ka).map((block, i): LegalBlock => {
    const other = english[i];
    if (block.kind === "list") {
      return { kind: "list", items: pairUp(block.items, other?.kind === "list" ? other.items : []) };
    }
    return { kind: "text", text: { ka: block.text, en: other?.kind === "text" ? other.text : block.text } };
  });
}

/** A list from the panel's own bullets box, kept for sections written before the boxes merged. */
export function pairItems(ka: string, en: string): LegalBlock[] {
  const items = pairUp(toItems(ka), toItems(en));
  return items.length > 0 ? [{ kind: "list", items }] : [];
}

/** The drafted copy (lib/content/legal.ts) already knows its shape; this is it as blocks. */
export function draftedBlocks(section: { paragraphs?: Bilingual[]; bullets?: Bilingual[] }): LegalBlock[] {
  const paragraphs = (section.paragraphs ?? []).map((text): LegalBlock => ({ kind: "text", text }));
  const bullets = section.bullets ?? [];
  return bullets.length > 0 ? [...paragraphs, { kind: "list", items: bullets }] : paragraphs;
}

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

export type RawBlock = { kind: "text"; text: string } | { kind: "list"; items: string[] };

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

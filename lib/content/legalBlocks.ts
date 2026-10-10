import type { Bilingual } from "./types";

export type LegalBlock =
  | { kind: "text"; text: Bilingual }
  | { kind: "list"; items: Bilingual[] };

export type LegalSectionView = { heading: Bilingual; blocks: LegalBlock[] };

export type RawBlock = { kind: "text"; text: string } | { kind: "list"; items: string[] };

const INVISIBLE = /[­​-‏⁠﻿]/g;

const BULLET = /^[•‣▪◦·*+–—-](?:\s+|$)/;

const clean = (line: string) => line.replace(INVISIBLE, "").replace(/ /g, " ").trim();

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

export const toItems = (text: string) =>
  text
    .split(/\r?\n/)
    .map(clean)
    .map((line) => line.replace(BULLET, ""))
    .filter(Boolean);

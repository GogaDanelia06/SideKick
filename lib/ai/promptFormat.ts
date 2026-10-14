import { parseBlocks } from "@/lib/markdown/blocks";

export function isSectioned(prompt: string): boolean {
  return parseBlocks(prompt).filter((block) => block.kind === "heading").length >= 2;
}

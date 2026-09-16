// A pictograph shown as emoji (by default, or forced with U+FE0F), with an optional skin tone.
const PICTOGRAPH = String.raw`(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}️)\p{Emoji_Modifier}?`;

// Flags, keycaps (1️⃣) and pictographs joined into one glyph with U+200D.
const EMOJI = String.raw`(?:\p{Regional_Indicator}{2}|[#*0-9]️?⃣|${PICTOGRAPH}(?:‍${PICTOGRAPH})*)`;

const RUN = String.raw`${EMOJI}(?:[ \t]*${EMOJI})*`;

const AT_LINE_START = new RegExp(String.raw`^([ \t]*)${RUN}[ \t]*`, "gmu");
const ELSEWHERE = new RegExp(String.raw`[ \t]*${RUN}`, "gu");
const LEFTOVERS = /[️‍⃣]/gu;

/**
 * Removes emoji, and the spaces that only existed to separate them, from a reply.
 * Text symbols such as ©, ™ and ₾ are kept.
 */
export function stripEmoji(text: string): string {
  return text
    .replace(AT_LINE_START, "$1")
    .replace(ELSEWHERE, "")
    .replace(LEFTOVERS, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

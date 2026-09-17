import { describe, it, expect } from "vitest";
import { AI_ADDRESS_FORMS, AI_DEFAULTS, AI_EMOJI_LEVELS, AI_LENGTHS, AI_STYLES, NO_EMOJI } from "./settings";

const stored = (options: { ka: string }[]) => options.map((o) => o.ka);

describe("AI character settings", () => {
  it("defaults to values the settings screen offers", () => {
    expect(stored(AI_STYLES)).toContain(AI_DEFAULTS.style);
    expect(stored(AI_LENGTHS)).toContain(AI_DEFAULTS.length);
    expect(stored(AI_EMOJI_LEVELS)).toContain(AI_DEFAULTS.emoji);
    expect(stored(AI_ADDRESS_FORMS)).toContain(AI_DEFAULTS.addressForm);
  });

  it("offers the level that turns emoji off", () => {
    expect(stored(AI_EMOJI_LEVELS)).toContain(NO_EMOJI);
  });

  it("has an English label for every option", () => {
    for (const option of [...AI_STYLES, ...AI_LENGTHS, ...AI_EMOJI_LEVELS, ...AI_ADDRESS_FORMS]) {
      expect(option.en).toMatch(/^[A-Z][a-z-]+$/);
    }
  });
});

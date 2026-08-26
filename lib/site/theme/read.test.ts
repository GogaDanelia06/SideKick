import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/site/content", () => ({ getSiteValue: vi.fn() }));
vi.mock("@/lib/logger", () => ({
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { BG_KEY, readTheme } from "./read";
import { THEME_KEY } from "./css";
import { findPreset, presetColors } from "./presets";
import { defaultColors } from "./tokens";
import { getSiteValue } from "@/lib/site/content";
import { log } from "@/lib/logger";

const stored = vi.mocked(getSiteValue);

function rows(map: Record<string, string | null>) {
  stored.mockImplementation(async (key: string) => map[key] ?? null);
}

beforeEach(() => {
  vi.clearAllMocks();
  rows({});
});

describe("readTheme()", () => {
  it("returns the shipped palette when nothing is saved", async () => {
    expect(await readTheme()).toEqual({
      dark: defaultColors("dark"),
      light: defaultColors("light"),
    });
  });

  it("carries an old background-only choice forward", async () => {
    // The setting this screen shipped with. A live site is already wearing one,
    // and reading only the new key would repaint it grey the moment this deploys.
    rows({ [BG_KEY]: "plum" });
    const plum = presetColors(findPreset("plum"), "dark");

    const theme = await readTheme();

    expect(theme.dark.bg).toBe(plum.bg);
    expect(theme.dark.canvas).toBe(plum.canvas);
  });

  it("takes only the background from that old choice, not the whole preset", async () => {
    // Someone who picked a background months ago did not also choose new borders
    // and a new grey — a deploy is the wrong moment to decide that they did.
    rows({ [BG_KEY]: "plum" });

    const theme = await readTheme();

    expect(theme.dark.card).toBe(defaultColors("dark").card);
    expect(theme.dark.blue).toBe(defaultColors("dark").blue);
  });

  it("prefers a saved palette over the old preset", async () => {
    rows({ [BG_KEY]: "plum", [THEME_KEY]: JSON.stringify({ dark: { bg: "#123456" } }) });

    expect((await readTheme()).dark.bg).toBe("#123456");
  });

  it("sanitizes what it reads back", async () => {
    rows({ [THEME_KEY]: JSON.stringify({ dark: { bg: "javascript:alert(1)", evil: "#000000" } }) });

    const theme = await readTheme();

    expect(theme.dark.bg).toBe(defaultColors("dark").bg);
    expect(theme.dark).not.toHaveProperty("evil");
  });

  it("survives an unparseable row, and says so", async () => {
    // Hand-edited in the database. The shipped palette is a far better answer
    // than a page with no colours, but a silent reset is unexplainable later.
    rows({ [THEME_KEY]: "{not json" });

    expect(await readTheme()).toEqual({
      dark: defaultColors("dark"),
      light: defaultColors("light"),
    });
    expect(vi.mocked(log.warn)).toHaveBeenCalledWith(
      expect.stringContaining("not valid JSON"),
      expect.anything(),
    );
  });
});

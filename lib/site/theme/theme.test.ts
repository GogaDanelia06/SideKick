import { describe, it, expect } from "vitest";
import { sanitize, sanitizeTheme, themeCss, defaultTheme, isDefault } from "./css";
import { derived, rgba } from "./derive";
import { failures, ratio } from "./contrast";
import { PRESETS, presetColors } from "./presets";
import { TOKENS, defaultColors } from "./tokens";

describe("sanitize()", () => {
  it("keeps a valid hex and lowercases it", () => {
    expect(sanitize({ bg: "#AABBCC" }, "dark").bg).toBe("#aabbcc");
  });

  it("falls back to the shipped colour for anything that is not #rrggbb", () => {
    // The result is written into a <style> element on every page of the platform,
    // so `red`, `#fff` and `; } body { display:none` all have to lose.
    const base = defaultColors("dark").bg;
    for (const bad of ["red", "#fff", "", "#12345g", "; }", null, 7, {}]) {
      expect(sanitize({ bg: bad }, "dark").bg).toBe(base);
    }
  });

  it("drops keys that are not tokens", () => {
    expect(sanitize({ evil: "#000000" }, "dark")).not.toHaveProperty("evil");
  });

  it("always returns every token, so no page can render without a colour", () => {
    expect(Object.keys(sanitize({}, "light")).sort()).toEqual(TOKENS.map((t) => t.id).sort());
  });

  it("reads both shades, and survives a missing one", () => {
    const theme = sanitizeTheme({ dark: { bg: "#101010" } });
    expect(theme.dark.bg).toBe("#101010");
    expect(theme.light.bg).toBe(defaultColors("light").bg);
  });
});

describe("themeCss()", () => {
  const css = themeCss(sanitizeTheme({ dark: { bg: "#123456" }, light: { bg: "#fedcba" } }));

  it("writes all four scopes", () => {
    expect(css).toContain("html:root{");
    expect(css).toContain("html .dash-scope{");
    expect(css).toContain('html:root[data-theme="light"]{');
    expect(css).toContain('html:root[data-theme="light"] .dash-scope{');
  });

  it("prefixes every selector with a type selector", () => {
    // Specificity, not decoration: the <style> element and the stylesheet <link>
    // can land in either order, and `:root` against `:root` would then be settled
    // by that order rather than by intent.
    for (const selector of css.match(/[^{}]+(?=\{)/g) ?? []) {
      expect(selector.trim().startsWith("html")).toBe(true);
    }
  });

  it("carries the chosen colours and the values derived from them", () => {
    expect(css).toContain("--bg:#123456");
    expect(css).toContain(`--header-bg:${rgba("#123456", 0.85)}`);
    expect(css).toContain("--bg:#fedcba");
  });

  it("puts dashboard-only tokens in the dash scope and nowhere else", () => {
    const root = css.slice(css.indexOf("html:root{"), css.indexOf("html .dash-scope{"));
    expect(root).not.toContain("--canvas:");
    expect(css).toContain("--canvas:");
  });
});

describe("derived()", () => {
  it("lifts a nested card away from the page in dark, and borrows the page in light", () => {
    const dark = defaultColors("dark");
    const light = defaultColors("light");
    expect(derived(dark, "dark").root["--card2"]).not.toBe(dark.card);
    expect(derived(light, "light").root["--card2"]).toBe(light.bg);
  });

  it("gives the primary button a hover that is not the button", () => {
    const c = defaultColors("dark");
    expect(derived(c, "dark").root["--primary-h"]).not.toBe(c.primary);
  });
});

describe("ratio()", () => {
  it("is 21 for black on white and 1 for a colour on itself", () => {
    expect(ratio("#000000", "#ffffff")).toBeCloseTo(21, 1);
    expect(ratio("#3fb950", "#3fb950")).toBeCloseTo(1, 5);
  });
});

describe("presets", () => {
  it("are all readable, in both shades", () => {
    // The one-click palettes are the path most people will take, so a preset
    // that fails the contrast check is a readability bug we shipped rather than
    // one the client chose.
    for (const preset of PRESETS) {
      for (const shade of ["dark", "light"] as const) {
        const bad = failures(presetColors(preset, shade)).map((f) => f.label.en);
        expect(bad, `${preset.id} / ${shade}`).toEqual([]);
      }
    }
  });

  it("leave the default preset as the shipped palette", () => {
    expect(presetColors(PRESETS[0], "dark")).toEqual(defaultColors("dark"));
  });
});

describe("isDefault()", () => {
  it("is true for the shipped palette and false once anything moves", () => {
    const theme = defaultTheme();
    expect(isDefault(theme)).toBe(true);
    theme.light.bg = "#111111";
    expect(isDefault(theme)).toBe(false);
  });
});

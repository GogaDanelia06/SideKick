import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { chosenTheme, rememberTheme, systemTheme, watchSystemTheme } from "./preference";
import { themeScript } from "./theme-script";
import { LEGACY_THEME_STORAGE_KEY, THEME_STORAGE_KEY } from "./config";

const data = new Map<string, string>();
const storage = {
  getItem: (key: string) => data.get(key) ?? null,
  setItem: (key: string, value: string) => void data.set(key, value),
  removeItem: (key: string) => void data.delete(key),
};
const broken = () => {
  throw new Error("blocked");
};

function systemPrefers(theme: "dark" | "light") {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("dark") && theme === "dark" }));
}

/** Runs the <head> script against the stubs and returns the theme it painted. */
function firstPaint(env: { matchMedia?: unknown; localStorage?: unknown } = {}): string | undefined {
  const document = { documentElement: { dataset: {} as Record<string, string> } };
  new Function("document", "matchMedia", "localStorage", themeScript)(
    document,
    env.matchMedia ?? globalThis.matchMedia,
    env.localStorage ?? storage,
  );
  return document.documentElement.dataset.theme;
}

beforeEach(() => {
  data.clear();
  vi.stubGlobal("localStorage", storage);
  systemPrefers("light");
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("first paint", () => {
  it("follows the system setting", () => {
    expect(firstPaint()).toBe("light");
    systemPrefers("dark");
    expect(firstPaint()).toBe("dark");
  });

  it("is light when the system cannot be asked", () => {
    expect(firstPaint({ matchMedia: broken })).toBe("light");
  });

  it("keeps a theme the visitor picked", () => {
    data.set(THEME_STORAGE_KEY, "dark");
    expect(firstPaint()).toBe("dark");
  });

  it("forgets what the old toggle saved, so everyone starts from the system", () => {
    data.set(LEGACY_THEME_STORAGE_KEY, "dark");
    expect(firstPaint()).toBe("light");
    expect(data.has(LEGACY_THEME_STORAGE_KEY)).toBe(false);
  });

  it("still follows the system when storage is blocked", () => {
    systemPrefers("dark");
    expect(firstPaint({ localStorage: { getItem: broken, removeItem: broken } })).toBe("dark");
  });
});

describe("theme preference", () => {
  it("reads the system setting, and falls back to light", () => {
    expect(systemTheme()).toBe("light");
    systemPrefers("dark");
    expect(systemTheme()).toBe("dark");
    vi.stubGlobal("matchMedia", broken);
    expect(systemTheme()).toBe("light");
  });

  it("remembers a pick that differs from the system", () => {
    rememberTheme("dark");
    expect(chosenTheme()).toBe("dark");
  });

  it("goes back to following the system when the pick matches it", () => {
    data.set(THEME_STORAGE_KEY, "dark");
    rememberTheme("light");
    expect(chosenTheme()).toBeNull();
  });

  it("ignores values it did not write, and blocked storage", () => {
    data.set(THEME_STORAGE_KEY, "blue");
    expect(chosenTheme()).toBeNull();
    vi.stubGlobal("localStorage", { getItem: broken, setItem: broken, removeItem: broken });
    expect(chosenTheme()).toBeNull();
    expect(() => rememberTheme("dark")).not.toThrow();
  });
});

describe("watchSystemTheme()", () => {
  it("reports each flip of the system setting until stopped", () => {
    const listeners = new Set<(event: { matches: boolean }) => void>();
    vi.stubGlobal("matchMedia", () => ({
      matches: false,
      addEventListener: (_: string, fn: (event: { matches: boolean }) => void) => listeners.add(fn),
      removeEventListener: (_: string, fn: (event: { matches: boolean }) => void) => listeners.delete(fn),
    }));
    const seen: string[] = [];
    const stop = watchSystemTheme((theme) => seen.push(theme));
    listeners.forEach((fn) => fn({ matches: true }));
    listeners.forEach((fn) => fn({ matches: false }));
    stop();
    listeners.forEach((fn) => fn({ matches: true }));

    expect(seen).toEqual(["dark", "light"]);
  });

  it("does nothing where the system cannot be watched", () => {
    vi.stubGlobal("matchMedia", broken);
    expect(() => watchSystemTheme(() => {})()).not.toThrow();
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { clearAiDrafts, dropDraft, readDraft, writeDraft } from "./drafts";

const data = new Map<string, string>();
const storage = {
  get length() {
    return data.size;
  },
  key: (i: number) => [...data.keys()][i] ?? null,
  getItem: (key: string) => data.get(key) ?? null,
  setItem: (key: string, value: string) => void data.set(key, value),
  removeItem: (key: string) => void data.delete(key),
};

const place = { userId: "u1", businessId: "b1", section: "business" as const };

beforeEach(() => {
  data.clear();
  vi.stubGlobal("localStorage", storage);
});
afterEach(() => vi.unstubAllGlobals());

describe("drafts", () => {
  it("keeps changes per user, business and section", () => {
    writeDraft(place, { name: ["Shop"] });

    expect(readDraft(place)?.fields).toEqual({ name: ["Shop"] });
    expect(readDraft({ ...place, businessId: "b2" })).toBeNull();
    expect(readDraft({ ...place, userId: "u2" })).toBeNull();
    expect(readDraft({ ...place, section: "rules" })).toBeNull();
  });

  it("drops a draft the server has, but not a newer one written meanwhile", () => {
    const first = writeDraft(place, { name: ["A"] });
    const second = writeDraft(place, { name: ["B"] });
    expect(second).toBeGreaterThan(first);

    dropDraft(place, first);
    expect(readDraft(place)?.fields).toEqual({ name: ["B"] });
    dropDraft(place, second);
    expect(readDraft(place)).toBeNull();
  });

  it("clears every draft on logout and leaves other keys alone", () => {
    writeDraft(place, { name: ["A"] });
    writeDraft({ ...place, businessId: "b2" }, { name: ["B"] });
    data.set("sidekick.theme-choice", "dark");

    clearAiDrafts();
    expect([...data.keys()]).toEqual(["sidekick.theme-choice"]);
  });

  it("ignores damaged entries and a browser that stores nothing", () => {
    data.set("sidekick.ai-draft:u1:b1:business", '{"id":1,"fields":{"name":"not a list"}}');
    expect(readDraft(place)).toBeNull();

    vi.stubGlobal("localStorage", undefined);
    expect(() => writeDraft(place, { name: ["A"] })).not.toThrow();
    expect(readDraft(place)).toBeNull();
    expect(() => clearAiDrafts()).not.toThrow();
  });
});

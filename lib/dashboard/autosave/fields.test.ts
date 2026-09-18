import { describe, it, expect } from "vitest";
import { changedFields, fieldsOf, toEntries } from "./fields";

const form = (...pairs: [string, string][]) => {
  const fd = new FormData();
  for (const [name, value] of pairs) fd.append(name, value);
  return fieldsOf(fd);
};

describe("fieldsOf()", () => {
  it("groups values by name, keeping every ticked checkbox in page order", () => {
    expect(form(["name", "Flower shop"], ["roles", "info"], ["roles", "sales"])).toEqual({
      name: ["Flower shop"],
      roles: ["info", "sales"],
    });
  });

  it("skips files", () => {
    const fd = new FormData();
    fd.append("logo", new Blob(["x"]), "logo.png");
    fd.append("name", "Shop");
    expect(fieldsOf(fd)).toEqual({ name: ["Shop"] });
  });
});

describe("changedFields()", () => {
  const saved = form(["name", "Shop"], ["email", ""], ["roles", "info"], ["leadEnabled", "on"]);

  it("is null when nothing changed, so leaving costs no request", () => {
    expect(changedFields(saved, form(["name", "Shop"], ["email", ""], ["roles", "info"], ["leadEnabled", "on"]))).toBeNull();
  });

  it("names only what changed, including an unticked checkbox and a new tick", () => {
    const now = form(["name", "Shop"], ["email", "info@shop.ge"], ["roles", "info"], ["roles", "sales"]);
    expect(changedFields(saved, now)).toEqual({
      email: ["info@shop.ge"],
      roles: ["info", "sales"],
      leadEnabled: [],
    });
  });

  it("notices a change of order in a group", () => {
    expect(changedFields(form(["roles", "a"], ["roles", "b"]), form(["roles", "b"], ["roles", "a"]))).toEqual({
      roles: ["b", "a"],
    });
  });
});

describe("toEntries()", () => {
  it("turns fields back into form pairs", () => {
    expect(toEntries({ name: ["Shop"], roles: ["info", "sales"], leadEnabled: [] })).toEqual([
      ["name", "Shop"],
      ["roles", "info"],
      ["roles", "sales"],
    ]);
  });
});

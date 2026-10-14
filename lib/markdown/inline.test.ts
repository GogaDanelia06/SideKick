import { describe, it, expect } from "vitest";
import { parseInline } from "./inline";

describe("parseInline()", () => {
  it("splits bold, italic and code out of the text", () => {
    expect(parseInline("ფასი **49₾** არის, *დღგ-ს* ჩათვლით, კოდი `PRO`")).toEqual([
      { kind: "text", text: "ფასი " },
      { kind: "strong", text: "49₾" },
      { kind: "text", text: " არის, " },
      { kind: "em", text: "დღგ-ს" },
      { kind: "text", text: " ჩათვლით, კოდი " },
      { kind: "code", text: "PRO" },
    ]);
  });

  it("leaves lone stars and snake_case words alone", () => {
    expect(parseInline("5 * 3 = 15 და user_name")).toEqual([{ kind: "text", text: "5 * 3 = 15 და user_name" }]);
  });
});

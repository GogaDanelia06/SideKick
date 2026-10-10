import { describe, it, expect } from "vitest";
import { GRAPH_FACEBOOK, GRAPH_INSTAGRAM, graphHostFor } from "./graphHost";

describe("graphHostFor()", () => {
  it("sends an Instagram Login token to graph.instagram.com", () => {
    expect(graphHostFor("INSTAGRAM", "IGAAxyz")).toBe(GRAPH_INSTAGRAM);
  });

  it("sends a Page token to graph.facebook.com even on an Instagram channel", () => {
    expect(graphHostFor("INSTAGRAM", "EAAxyz")).toBe(GRAPH_FACEBOOK);
  });

  it("always uses graph.facebook.com for Facebook", () => {
    expect(graphHostFor("FACEBOOK", "EAAxyz")).toBe(GRAPH_FACEBOOK);
    expect(graphHostFor("FACEBOOK", "IGAAxyz")).toBe(GRAPH_FACEBOOK);
  });
});

import { describe, it, expect } from "vitest";
import { GRAPH_FACEBOOK, GRAPH_INSTAGRAM, graphHostFor } from "./graphHost";

/**
 * One rule, two callers — replies in send.ts and customer names in profile.ts.
 * They each had their own copy of this decision and drifted: sending was fixed
 * to read the token, naming still read the channel type, and every Instagram
 * chat linked through a Facebook Page stayed nameless.
 */
describe("graphHostFor()", () => {
  it("sends an Instagram Login token to graph.instagram.com", () => {
    expect(graphHostFor("INSTAGRAM", "IGAAxyz")).toBe(GRAPH_INSTAGRAM);
  });

  it("sends a Page token to graph.facebook.com even on an Instagram channel", () => {
    // The case that was broken: an Instagram account carried across with a
    // Facebook Page holds the Page's `EAA…` token, which graph.instagram.com
    // refuses outright.
    expect(graphHostFor("INSTAGRAM", "EAAxyz")).toBe(GRAPH_FACEBOOK);
  });

  it("always uses graph.facebook.com for Facebook", () => {
    expect(graphHostFor("FACEBOOK", "EAAxyz")).toBe(GRAPH_FACEBOOK);
    // Even a nonsense token: Facebook has no second host to be wrong about.
    expect(graphHostFor("FACEBOOK", "IGAAxyz")).toBe(GRAPH_FACEBOOK);
  });
});

import { describe, expect, it } from "vitest";
import { safeCallbackUrl } from "./callbackUrl";

const HOME = "/dashboard";

describe("safeCallbackUrl", () => {
  it("keeps a path on this site", () => {
    expect(safeCallbackUrl("/dashboard/billing")).toBe("/dashboard/billing");
  });

  it("keeps a query string and a fragment", () => {
    expect(safeCallbackUrl("/dashboard/billing?plan=pro#pay")).toBe(
      "/dashboard/billing?plan=pro#pay",
    );
  });

  it("falls back when nothing was asked for", () => {
    expect(safeCallbackUrl(null)).toBe(HOME);
    expect(safeCallbackUrl(undefined)).toBe(HOME);
    expect(safeCallbackUrl("")).toBe(HOME);
  });

  it("honours an explicit fallback", () => {
    expect(safeCallbackUrl(null, "/dashboard/billing")).toBe("/dashboard/billing");
  });

  /**
   * The reason this function exists. Each of these would send the customer to
   * another host from a link that looked like ours.
   */
  it("refuses anywhere off this site", () => {
    for (const hostile of [
      "https://evil.com",
      "http://evil.com",
      "//evil.com", // protocol-relative — the one `startsWith("/")` lets through
      "///evil.com",
      "/\\evil.com", // backslash, which some browsers normalise to a slash
      "javascript:alert(1)",
      "mailto:someone@evil.com",
      "evil.com",
      "dashboard/billing", // no leading slash: resolves relative to the current path
    ]) {
      expect(safeCallbackUrl(hostile), hostile).toBe(HOME);
    }
  });
});

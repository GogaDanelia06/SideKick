import { describe, it, expect, beforeEach } from "vitest";
import { tbc } from "./tbc";

describe("tbc.refFromCallback", () => {
  it("reads PaymentId from a JSON body", () => {
    expect(tbc.refFromCallback(JSON.stringify({ PaymentId: "pay-1" }))).toBe("pay-1");
  });

  it("accepts the lowercase spelling too", () => {
    expect(tbc.refFromCallback(JSON.stringify({ paymentId: "pay-2" }))).toBe("pay-2");
  });

  it("falls back to form encoding", () => {
    expect(tbc.refFromCallback("PaymentId=pay-3")).toBe("pay-3");
  });

  it("returns null when there is no id anywhere", () => {
    expect(tbc.refFromCallback("something=else")).toBeNull();
  });
});

describe("tbc.isConfigured", () => {
  beforeEach(() => {
    delete process.env.TBC_API_KEY;
    delete process.env.TBC_CLIENT_ID;
    delete process.env.TBC_CLIENT_SECRET;
  });

  it("is false with no credentials", () => {
    expect(tbc.isConfigured()).toBe(false);
  });

  it("is false when only some credentials are set", () => {
    process.env.TBC_API_KEY = "k";
    process.env.TBC_CLIENT_ID = "id";
    expect(tbc.isConfigured()).toBe(false);
  });

  it("is true once all three are set", () => {
    process.env.TBC_API_KEY = "k";
    process.env.TBC_CLIENT_ID = "id";
    process.env.TBC_CLIENT_SECRET = "s";
    expect(tbc.isConfigured()).toBe(true);
  });
});

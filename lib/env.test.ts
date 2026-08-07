import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { env, resetEnvCache } from "./env";

const CORE = {
  DATABASE_URL: "postgresql://user@localhost:5432/db",
  AUTH_SECRET: "a-secret-long-enough-to-be-real",
};

const original = { ...process.env };

function setEnv(vars: Record<string, string | undefined>) {
  for (const key of Object.keys(process.env)) {
    if (key.startsWith("AI_SERVICE") || key.startsWith("META_") || key.startsWith("AUTH_")) {
      delete process.env[key];
    }
  }
  Object.assign(process.env, CORE, vars);
  resetEnvCache();
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  setEnv({});
});

afterEach(() => {
  process.env = { ...original };
  resetEnvCache();
  vi.restoreAllMocks();
});

describe("env()", () => {
  it("throws when a variable the app cannot run without is missing", () => {
    setEnv({});
    delete process.env.AUTH_SECRET;
    resetEnvCache();

    expect(() => env()).toThrow(/AUTH_SECRET/);
  });

  it("reads the optional settings when they are valid", () => {
    setEnv({
      META_VERIFY_TOKEN: "a-verify-token-long-enough",
      AI_SERVICE_WEBHOOK_URL: "https://ai.example.com/hook",
    });

    expect(env().META_VERIFY_TOKEN).toBe("a-verify-token-long-enough");
    expect(env().AI_SERVICE_WEBHOOK_URL).toBe("https://ai.example.com/hook");
  });

  it("treats a blank value as not set rather than as broken", () => {
    // Adding a variable in a hosting panel and leaving the box empty stores an
    // empty string. That is a placeholder, not a misconfiguration.
    setEnv({ AI_SERVICE_WEBHOOK_URL: "", META_APP_SECRET: "" });

    expect(() => env()).not.toThrow();
    expect(env().AI_SERVICE_WEBHOOK_URL).toBeUndefined();
  });

  it("does not let a malformed optional setting take the app down", () => {
    // The regression this exists for: `env()` runs on every signed-in request,
    // so throwing here emptied the whole dashboard over a Facebook setting.
    setEnv({ AI_SERVICE_WEBHOOK_URL: "not-a-url", META_VERIFY_TOKEN: "short" });

    expect(() => env()).not.toThrow();
    expect(env().AI_SERVICE_WEBHOOK_URL).toBeUndefined();
    expect(env().META_VERIFY_TOKEN).toBeUndefined();
  });

  it("keeps the good settings when a neighbour is malformed", () => {
    setEnv({
      AI_SERVICE_WEBHOOK_URL: "not-a-url",
      META_VERIFY_TOKEN: "a-verify-token-long-enough",
    });

    expect(env().META_VERIFY_TOKEN).toBe("a-verify-token-long-enough");
    expect(env().AI_SERVICE_WEBHOOK_URL).toBeUndefined();
  });

  it("says which setting it ignored, so the cause is findable", () => {
    setEnv({ AI_SERVICE_TOKEN: "too-short" });
    env();

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("AI_SERVICE_TOKEN"));
  });
});

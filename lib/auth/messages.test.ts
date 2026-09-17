import { describe, it, expect } from "vitest";
import { AUTH_MESSAGES, authMessage, refusalMessage, tooManyAttempts } from "./messages";
import { registerSchema, resetSchema } from "@/lib/validation/auth";

const FALLBACK = { ka: "ვერ შესრულდა", en: "Failed" };

describe("authMessage()", () => {
  it("translates a validation code", () => {
    expect(authMessage("passwordLength")).toBe(AUTH_MESSAGES.passwordLength);
  });

  it("treats unknown and inherited names as invalid input", () => {
    expect(authMessage("nope")).toBe(AUTH_MESSAGES.invalidInput);
    expect(authMessage("toString")).toBe(AUTH_MESSAGES.invalidInput);
    expect(authMessage(undefined)).toBe(AUTH_MESSAGES.invalidInput);
  });

  it("knows every message the server schemas can produce", () => {
    const register = registerSchema.safeParse({
      firstName: "1",
      email: "x",
      password: "short",
      phone: "abc",
      company: "c".repeat(121),
    });
    const reset = resetSchema.safeParse({ token: "t", password: "Password1", repeatPassword: "x" });
    const issues = [...(register.error?.issues ?? []), ...(reset.error?.issues ?? [])];

    expect(issues.length).toBeGreaterThan(4);
    for (const issue of issues) expect(Object.keys(AUTH_MESSAGES)).toContain(issue.message);
  });
});

describe("tooManyAttempts()", () => {
  it("rounds the wait up to whole minutes in both languages", () => {
    expect(tooManyAttempts(1).en).toBe("Too many attempts. Try again in 1 minute.");
    expect(tooManyAttempts(90).en).toBe("Too many attempts. Try again in 2 minutes.");
    expect(tooManyAttempts(120).ka).toContain("2 წუთში");
  });
});

describe("refusalMessage()", () => {
  it("reads the message an auth route sends", () => {
    const body = { error: "ka text", message: { ka: "ka text", en: "en text" } };
    expect(refusalMessage(body, FALLBACK)).toEqual({ ka: "ka text", en: "en text" });
  });

  it("falls back when the body has no usable message", () => {
    expect(refusalMessage({ error: "only a string" }, FALLBACK)).toBe(FALLBACK);
    expect(refusalMessage({ message: { ka: "half" } }, FALLBACK)).toBe(FALLBACK);
    expect(refusalMessage(null, FALLBACK)).toBe(FALLBACK);
  });
});

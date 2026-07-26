import { describe, it, expect } from "vitest";
import { passwordSchema, registerSchema, resetSchema, forgotSchema } from "./auth";

describe("passwordSchema", () => {
  it("accepts an 8-char password with a letter and a digit", () => {
    expect(passwordSchema.safeParse("abcdef12").success).toBe(true);
  });

  it("accepts Georgian letters as the letter requirement", () => {
    expect(passwordSchema.safeParse("გამარჯობა1").success).toBe(true);
  });

  it("rejects the classic weak password", () => {
    expect(passwordSchema.safeParse("123456").success).toBe(false);
  });

  it("rejects fewer than 8 characters", () => {
    expect(passwordSchema.safeParse("abc123").success).toBe(false);
  });

  it("rejects all-letters (no digit)", () => {
    expect(passwordSchema.safeParse("abcdefgh").success).toBe(false);
  });

  it("rejects all-digits (no letter)", () => {
    expect(passwordSchema.safeParse("12345678").success).toBe(false);
  });

  it("counts length at exactly the 8-char boundary", () => {
    expect(passwordSchema.safeParse("abcdef1").success).toBe(false);
    expect(passwordSchema.safeParse("abcdef12").success).toBe(true);
  });
});

describe("registerSchema", () => {
  const valid = {
    firstName: "Nino",
    email: "nino@example.com",
    password: "abcdef12",
  };

  it("accepts a minimal valid registration", () => {
    const r = registerSchema.safeParse(valid);
    expect(r.success).toBe(true);
  });

  it("defaults lastName to an empty string", () => {
    const r = registerSchema.parse(valid);
    expect(r.lastName).toBe("");
  });

  it("requires a first name", () => {
    expect(registerSchema.safeParse({ ...valid, firstName: "" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...valid, firstName: "   " }).success).toBe(false);
  });

  it("rejects a malformed email", () => {
    expect(registerSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });

  it("applies the shared password rule", () => {
    expect(registerSchema.safeParse({ ...valid, password: "123456" }).success).toBe(false);
  });

  it("trims surrounding whitespace on names", () => {
    const r = registerSchema.parse({ ...valid, firstName: "  Nino  " });
    expect(r.firstName).toBe("Nino");
  });
});

describe("resetSchema", () => {
  const token = "a".repeat(64);

  it("accepts a matching password pair with a long-enough token", () => {
    const r = resetSchema.safeParse({ token, password: "abcdef12", repeatPassword: "abcdef12" });
    expect(r.success).toBe(true);
  });

  it("rejects when the two passwords differ", () => {
    const r = resetSchema.safeParse({ token, password: "abcdef12", repeatPassword: "abcdef13" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]?.path).toContain("repeatPassword");
  });

  it("rejects a short token", () => {
    expect(
      resetSchema.safeParse({ token: "short", password: "abcdef12", repeatPassword: "abcdef12" })
        .success,
    ).toBe(false);
  });

  it("still enforces the password rule on reset", () => {
    expect(
      resetSchema.safeParse({ token, password: "weak", repeatPassword: "weak" }).success,
    ).toBe(false);
  });
});

describe("forgotSchema", () => {
  it("accepts a valid email", () => {
    expect(forgotSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
  });
  it("rejects a malformed email", () => {
    expect(forgotSchema.safeParse({ email: "nope" }).success).toBe(false);
  });
});

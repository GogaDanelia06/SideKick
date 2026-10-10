import { describe, it, expect } from "vitest";
import { validateLogin } from "./loginValidation";

describe("validateLogin()", () => {
  it("accepts an email and a password", () => {
    expect(validateLogin("gio@example.com", "x")).toEqual({});
  });

  it("asks for both when both are empty", () => {
    expect(validateLogin("", "")).toEqual({ email: "emailRequired", password: "passwordRequired" });
  });

  it("rejects an email that cannot be real", () => {
    expect(validateLogin("nope", "x")).toEqual({ email: "emailInvalid" });
  });
});

import { describe, it, expect } from "vitest";
import { readRegisterForm, validateRegister, type RegisterValues } from "./registerValidation";

const valid: RegisterValues = {
  firstName: "გიორგი",
  lastName: "",
  email: "gio@example.com",
  password: "Strong1pass",
  repeatPassword: "Strong1pass",
  phone: "",
  company: "",
  field: "",
};

describe("validateRegister()", () => {
  it("accepts a complete form, with the optional fields left empty", () => {
    expect(validateRegister(valid)).toEqual({});
  });

  it("asks for a first name and an email, and rejects ones that cannot be real", () => {
    expect(validateRegister({ ...valid, firstName: "", email: "" })).toEqual({
      firstName: "firstNameRequired",
      email: "emailRequired",
    });
    expect(validateRegister({ ...valid, firstName: "123", email: "nope" })).toEqual({
      firstName: "nameInvalid",
      email: "emailInvalid",
    });
  });

  it("names the first password rule that is broken", () => {
    const problem = (password: string) => validateRegister({ ...valid, password, repeatPassword: password }).password;

    expect(problem("")).toBe("passwordRequired");
    expect(problem("Ab1")).toBe("passwordLength");
    expect(problem("ABCDEFG1")).toBe("passwordLowercase");
    expect(problem("abcdefg1")).toBe("passwordUppercase");
    expect(problem("Abcdefgh")).toBe("passwordNumberOrSymbol");
  });

  it("needs the password typed twice, the same both times", () => {
    expect(validateRegister({ ...valid, repeatPassword: "" }).repeatPassword).toBe("repeatRequired");
    expect(validateRegister({ ...valid, repeatPassword: "Other1pass" }).repeatPassword).toBe("passwordsMismatch");
  });

  it("checks a phone number only when one is given", () => {
    expect(validateRegister({ ...valid, phone: "abc" }).phone).toBe("phoneInvalid");
    expect(validateRegister({ ...valid, phone: "" }).phone).toBeUndefined();
  });
});

describe("readRegisterForm()", () => {
  it("trims what people type, but never a password", () => {
    const fd = new FormData();
    fd.set("firstName", "  გიორგი ");
    fd.set("email", " gio@example.com ");
    fd.set("password", " secret ");

    expect(readRegisterForm(fd)).toMatchObject({ firstName: "გიორგი", email: "gio@example.com", password: " secret ", company: "" });
  });
});

import type { AuthMessageKey } from "@/lib/auth/messages";
import {
  EMAIL_PATTERN,
  NAME_PATTERN,
  PASSWORD_NUMBER_OR_SYMBOL_PATTERN,
  PHONE_PATTERN,
} from "@/lib/validation/patterns";

export type RegisterField =
  | "firstName"
  | "lastName"
  | "email"
  | "password"
  | "repeatPassword"
  | "phone"
  | "company"
  | "field";

export type RegisterErrors = Partial<Record<RegisterField, AuthMessageKey>>;

export type RegisterValues = Record<RegisterField, string>;

export function readRegisterForm(fd: FormData): RegisterValues {
  const trimmed = (name: string) => String(fd.get(name) ?? "").trim();
  const exact = (name: string) => String(fd.get(name) ?? "");

  return {
    firstName: trimmed("firstName"),
    lastName: trimmed("lastName"),
    email: trimmed("email"),
    password: exact("password"),
    repeatPassword: exact("repeatPassword"),
    phone: trimmed("phone"),
    company: trimmed("company"),
    field: trimmed("field"),
  };
}

function passwordProblem(password: string): AuthMessageKey | null {
  if (!password) return "passwordRequired";
  if (password.length < 8) return "passwordLength";
  if (!/[a-z]/.test(password)) return "passwordLowercase";
  if (!/[A-Z]/.test(password)) return "passwordUppercase";
  if (!PASSWORD_NUMBER_OR_SYMBOL_PATTERN.test(password)) return "passwordNumberOrSymbol";
  return null;
}

export function validateRegister(values: RegisterValues): RegisterErrors {
  const { firstName, lastName, email, password, repeatPassword, phone } = values;
  const errors: RegisterErrors = {};

  if (!firstName) errors.firstName = "firstNameRequired";
  else if (!NAME_PATTERN.test(firstName)) errors.firstName = "nameInvalid";

  if (lastName && !NAME_PATTERN.test(lastName)) errors.lastName = "nameInvalid";

  if (!email) errors.email = "emailRequired";
  else if (!EMAIL_PATTERN.test(email)) errors.email = "emailInvalid";

  const problem = passwordProblem(password);
  if (problem) errors.password = problem;

  if (!repeatPassword) errors.repeatPassword = "repeatRequired";
  else if (password !== repeatPassword) errors.repeatPassword = "passwordsMismatch";

  if (phone && !PHONE_PATTERN.test(phone)) errors.phone = "phoneInvalid";

  return errors;
}

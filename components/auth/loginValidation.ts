import { EMAIL_PATTERN } from "@/lib/validation/patterns";

export type LoginField = "email" | "password";
export type LoginErrorKey = "emailRequired" | "emailInvalid" | "passwordRequired";
export type LoginErrors = Partial<Record<LoginField, LoginErrorKey>>;

export function validateLogin(email: string, password: string): LoginErrors {
  const errors: LoginErrors = {};

  if (!email) errors.email = "emailRequired";
  else if (!EMAIL_PATTERN.test(email)) errors.email = "emailInvalid";

  if (!password) errors.password = "passwordRequired";

  return errors;
}

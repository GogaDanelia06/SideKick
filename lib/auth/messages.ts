import type { Text } from "@/lib/i18n/messages";
import type { Bilingual } from "@/lib/i18n/types";

/**
 * What the sign-up, sign-in and password screens can be told, in both languages.
 * The keys double as the validation messages of lib/validation/auth.ts, so a
 * refusal from the server reads the same as the form's own check.
 */
export const AUTH_MESSAGES = {
  firstNameRequired: "auth.messages.firstNameIsRequired",
  nameInvalid: "auth.messages.useOnlyLettersSpaces",
  emailRequired: "auth.messages.emailIsRequired",
  emailInvalid: "auth.messages.enterAValidEmail",
  passwordRequired: "auth.messages.passwordIsRequired",
  passwordLength: "auth.messages.passwordMustBeAt",
  passwordLowercase: "auth.messages.passwordMustContainAt",
  passwordUppercase: "auth.messages.passwordMustContainAt2",
  passwordNumberOrSymbol: "auth.messages.passwordMustContainAt3",
  repeatRequired: "auth.messages.pleaseRepeatYourPassword",
  passwordsMismatch: "auth.messages.passwordsDonTMatch",
  phoneInvalid: "auth.messages.enterAValidPhone",
  companyTooLong: "auth.messages.theCompanyNameIs",
  fieldTooLong: "auth.messages.theFieldOfActivity",
  invalidInput: "auth.messages.someOfTheDetails",
  emailTaken: "auth.messages.thisEmailIsAlready",
  emailUnknown: "auth.messages.thisEmailIsNot",
  linkInvalid: "auth.messages.theLinkIsInvalid",
} satisfies Record<string, Text>;

export type AuthMessageKey = keyof typeof AUTH_MESSAGES;

/** The message for a validation code; anything unknown reads as generally invalid input. */
export function authMessage(code: string | undefined): Text {
  return code && Object.hasOwn(AUTH_MESSAGES, code)
    ? AUTH_MESSAGES[code as AuthMessageKey]
    : AUTH_MESSAGES.invalidInput;
}

export function tooManyAttempts(retryAfterSec: number): Bilingual {
  const minutes = Math.ceil(retryAfterSec / 60);
  return {
    ka: `ძალიან ბევრი მცდელობა. სცადეთ ხელახლა ${minutes} წუთში.`,
    en: `Too many attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
  };
}

/** The translated message an auth API refusal carries, or `fallback` when it has none. */
export function refusalMessage(body: unknown, fallback: Text): Text {
  const message = (body as { message?: Partial<Bilingual> } | null)?.message;
  return typeof message?.ka === "string" && typeof message.en === "string"
    ? { ka: message.ka, en: message.en }
    : fallback;
}

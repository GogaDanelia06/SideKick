import type { Bilingual } from "@/lib/content/types";

/**
 * What the sign-up, sign-in and password screens can be told, in both languages.
 * The keys double as the validation messages of lib/validation/auth.ts, so a
 * refusal from the server reads the same as the form's own check.
 */
export const AUTH_MESSAGES = {
  firstNameRequired: { ka: "სახელი სავალდებულოა", en: "First name is required" },
  nameInvalid: {
    ka: "გამოიყენეთ მხოლოდ ასოები, გამოტოვება, დეფისი ან აპოსტროფი",
    en: "Use only letters, spaces, hyphens, or apostrophes",
  },
  emailRequired: { ka: "ელფოსტა სავალდებულოა", en: "Email is required" },
  emailInvalid: { ka: "შეიყვანეთ სწორი ელფოსტა", en: "Enter a valid email address" },
  passwordRequired: { ka: "პაროლი სავალდებულოა", en: "Password is required" },
  passwordLength: {
    ka: "პაროლი უნდა იყოს მინიმუმ 8 სიმბოლო",
    en: "Password must be at least 8 characters",
  },
  passwordLowercase: {
    ka: "პაროლი უნდა შეიცავდეს მინიმუმ ერთ პატარა ასოს",
    en: "Password must contain at least one lowercase letter",
  },
  passwordUppercase: {
    ka: "პაროლი უნდა შეიცავდეს მინიმუმ ერთ დიდ ასოს",
    en: "Password must contain at least one uppercase letter",
  },
  passwordNumberOrSymbol: {
    ka: "პაროლი უნდა შეიცავდეს მინიმუმ ერთ ციფრს ან სპეციალურ სიმბოლოს",
    en: "Password must contain at least one number or special character",
  },
  repeatRequired: { ka: "გაიმეორეთ პაროლი", en: "Please repeat your password" },
  passwordsMismatch: { ka: "პაროლები არ ემთხვევა", en: "Passwords don't match" },
  phoneInvalid: { ka: "შეიყვანეთ სწორი ტელეფონის ნომერი", en: "Enter a valid phone number" },
  companyTooLong: { ka: "კომპანიის სახელი ძალიან გრძელია", en: "The company name is too long" },
  fieldTooLong: { ka: "საქმიანობის სფერო ძალიან გრძელია", en: "The field of activity is too long" },
  invalidInput: { ka: "შეყვანილი მონაცემები არასწორია", en: "Some of the details are not valid" },
  emailTaken: { ka: "ეს მეილი უკვე რეგისტრირებულია", en: "This email is already registered" },
  emailUnknown: { ka: "ეს მეილი არ არის დარეგისტრირებული", en: "This email is not registered" },
  linkInvalid: {
    ka: "ბმული არასწორია ან ვადა გაუვიდა. მოითხოვეთ ახალი.",
    en: "The link is invalid or has expired. Request a new one.",
  },
} satisfies Record<string, Bilingual>;

export type AuthMessageKey = keyof typeof AUTH_MESSAGES;

/** The message for a validation code; anything unknown reads as generally invalid input. */
export function authMessage(code: string | undefined): Bilingual {
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
export function refusalMessage(body: unknown, fallback: Bilingual): Bilingual {
  const message = (body as { message?: Partial<Bilingual> } | null)?.message;
  return typeof message?.ka === "string" && typeof message.en === "string"
    ? { ka: message.ka, en: message.en }
    : fallback;
}

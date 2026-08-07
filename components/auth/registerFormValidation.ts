const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME = /^[A-Za-zÀ-ÖØ-öø-ÿა-ჰ' -]+$/;
const PHONE = /^\+?[0-9\s().-]+$/;
const NUMBER_OR_SYMBOL = /[0-9]|[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/;

export type RegisterData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  repeatPassword: string;
  phone: string;
  company: string;
  field: string;
};

type ErrorKey =
  | "firstNameRequired"
  | "nameInvalid"
  | "emailRequired"
  | "emailInvalid"
  | "passwordRequired"
  | "passwordLength"
  | "passwordLowercase"
  | "passwordUppercase"
  | "passwordNumberOrSymbol"
  | "repeatRequired"
  | "passwordsMismatch"
  | "phoneInvalid";

export type RegisterErrors = Partial<Record<keyof RegisterData, ErrorKey>>;

export const REGISTER_VALIDATION_MESSAGES = {
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
} as const;

export function formPayload(fd: FormData): RegisterData {
  const get = (name: string) => String(fd.get(name) ?? "").trim();
  return {
    firstName: get("firstName"),
    lastName: get("lastName"),
    email: get("email"),
    password: String(fd.get("password") ?? ""),
    repeatPassword: String(fd.get("repeatPassword") ?? ""),
    phone: get("phone"),
    company: get("company"),
    field: get("field"),
  };
}

export function validateRegisterForm(data: RegisterData): RegisterErrors {
  const e: RegisterErrors = {};
  if (!data.firstName) e.firstName = "firstNameRequired";
  else if (!NAME.test(data.firstName)) e.firstName = "nameInvalid";
  if (data.lastName && !NAME.test(data.lastName)) e.lastName = "nameInvalid";
  if (!data.email) e.email = "emailRequired";
  else if (!EMAIL.test(data.email)) e.email = "emailInvalid";
  if (!data.password) e.password = "passwordRequired";
  else if (data.password.length < 8) e.password = "passwordLength";
  else if (!/[a-z]/.test(data.password)) e.password = "passwordLowercase";
  else if (!/[A-Z]/.test(data.password)) e.password = "passwordUppercase";
  else if (!NUMBER_OR_SYMBOL.test(data.password)) e.password = "passwordNumberOrSymbol";
  if (!data.repeatPassword) e.repeatPassword = "repeatRequired";
  else if (data.password !== data.repeatPassword) e.repeatPassword = "passwordsMismatch";
  if (data.phone && !PHONE.test(data.phone)) e.phone = "phoneInvalid";
  return e;
}

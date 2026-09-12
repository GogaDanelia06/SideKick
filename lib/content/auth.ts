import type { Bilingual } from "./types";

export const AUTH_OR: Bilingual = { ka: "ან", en: "or" };

export const LOGIN = {
  title: { ka: "კეთილი იყოს დაბრუნება", en: "Welcome back" },
  sub: { ka: "შედი შენს სამართავ პანელში", en: "Sign in to your dashboard" },
  google: { ka: "Google-ით შესვლა", en: "Sign in with Google" },
  email: { ka: "ელფოსტა", en: "Email" },
  password: { ka: "პაროლი", en: "Password" },
  remember: { ka: "დამიმახსოვრე", en: "Remember me" },
  forgot: { ka: "პაროლის აღდგენა", en: "Forgot password" },
  submit: { ka: "ავტორიზაცია", en: "Sign in" },
  invalid: { ka: "ელფოსტა ან პაროლი არასწორია", en: "Invalid email or password" },
  rateLimited: {
    ka: "ძალიან ბევრი მცდელობა. სცადეთ ხელახლა რამდენიმე წუთში.",
    en: "Too many attempts. Please try again in a few minutes.",
  },
  // Shown only after a correct password, so it never reveals which addresses exist.
  unverified: {
    ka: "ელფოსტა ჯერ არ არის დადასტურებული. შეამოწმე ფოსტა — გამოგზავნილია ბმული.",
    en: "Your email is not confirmed yet. Check your inbox — we sent you a link.",
  },
  resend: { ka: "ბმულის ხელახლა გაგზავნა", en: "Send the link again" },
  resending: { ka: "იგზავნება…", en: "Sending…" },
  // Worded as "if": the endpoint answers the same for unknown addresses.
  resendDone: {
    ka: "თუ ანგარიში არსებობს და ჯერ არ არის დადასტურებული, ბმული გაიგზავნა.",
    en: "If that account exists and is not confirmed yet, the link has been sent.",
  },
  verifyOk: {
    ka: "ელფოსტა დადასტურდა. ახლა შეგიძლია შეხვიდე.",
    en: "Email confirmed. You can sign in now.",
  },
  verifyAlready: {
    ka: "ეს ელფოსტა უკვე დადასტურებულია.",
    en: "This email is already confirmed.",
  },
  verifyInvalid: {
    ka: "ბმული აღარ მოქმედებს. შედი და ახალს გამოგიგზავნით.",
    en: "That link is no longer valid. Sign in and we will send a new one.",
  },
  noAccount: { ka: "არ გაქვს ანგარიში?", en: "Don't have an account?" },
  signUp: { ka: "რეგისტრაცია", en: "Sign up" },
} satisfies Record<string, Bilingual>;

export const REGISTER = {
  title: { ka: "შექმენი ანგარიში", en: "Create an account" },
  sub: { ka: "პირველი თვე უფასოა — ბარათი არ არის საჭირო", en: "First month is free — no card required" },
  google: { ka: "Google-ით რეგისტრაცია", en: "Sign up with Google" },
  firstName: { ka: "სახელი", en: "First name" },
  lastName: { ka: "გვარი", en: "Last name" },
  email: { ka: "ელფოსტა", en: "Email" },
  password: { ka: "პაროლი", en: "Password" },
  repeatPassword: { ka: "გაიმეორე პაროლი", en: "Repeat password" },
  phone: { ka: "ტელეფონის ნომერი", en: "Phone number" },
  company: { ka: "კომპანიის დასახელება", en: "Company name" },
  industry: { ka: "საქმიანობის სფერო", en: "Industry" },
  optional: { ka: "(არასავალდებულო)", en: "(optional)" },
  submit: { ka: "რეგისტრაცია", en: "Sign up" },
  sent: {
    ka: "ანგარიში შექმნილია. შეგიძლია დაიწყო მუშაობა.",
    en: "Your account is ready. You can start right away.",
  },
  checkInbox: {
    ka: "დაგირეგისტრირდი! გამოგიგზავნეთ ბმული — შედი ფოსტაზე და დაადასტურე ელფოსტა. ბმული 24 საათია აქტიური.",
    en: "You're registered. We've emailed you a link — open your inbox and confirm your address. The link lasts 24 hours.",
  },
  haveAccount: { ka: "უკვე გაქვს ანგარიში?", en: "Already have an account?" },
  signIn: { ka: "შესვლა", en: "Sign in" },
} satisfies Record<string, Bilingual>;

export const FORGOT = {
  title: { ka: "პაროლის აღდგენა", en: "Reset password" },
  sub: { ka: "ჩაწერე მაილი და გამოგიგზავნით აღდგენის ბმულს", en: "Enter your email and we'll send a reset link" },
  email: { ka: "ელფოსტა", en: "Email" },
  submit: { ka: "აღდგენის ბმულის გაგზავნა", en: "Send reset link" },
  back: { ka: "შესვლაზე დაბრუნება", en: "Back to sign in" },
  sent: {
    ka: "აღდგენის ბმული გამოგზავნილია. შეამოწმე ფოსტა — თუ არ ჩანს, შეამოწმე Spam-ც.",
    en: "A reset link has been sent. Check your inbox — and your spam folder if it is not there.",
  },
  notRegistered: {
    ka: "ეს მეილი არ არის დარეგისტრირებული.",
    en: "That email is not registered.",
  },
  createAccount: { ka: "შექმენი ანგარიში", en: "Create an account" },
  sentNote: {
    ka: "ბმული აქტიურია 1 საათის განმავლობაში.",
    en: "The link is valid for 1 hour.",
  },
} satisfies Record<string, Bilingual>;

export const RESET = {
  title: { ka: "ახალი პაროლი", en: "New password" },
  sub: { ka: "შეიყვანე ახალი პაროლი შენი ანგარიშისთვის", en: "Enter a new password for your account" },
  password: { ka: "ახალი პაროლი", en: "New password" },
  repeat: { ka: "გაიმეორე პაროლი", en: "Repeat password" },
  submit: { ka: "პაროლის შეცვლა", en: "Change password" },
  hint: { ka: "მინიმუმ 8 სიმბოლო, ასო და ციფრი", en: "At least 8 characters, with a letter and a digit" },
  done: { ka: "პაროლი შეიცვალა. ახლა შეგიძლია შეხვიდე.", en: "Password changed. You can sign in now." },
  toLogin: { ka: "შესვლა", en: "Sign in" },
  badLink: {
    ka: "ბმული არასწორია ან ვადა გაუვიდა.",
    en: "This link is invalid or has expired.",
  },
  requestNew: { ka: "ახალი ბმულის მოთხოვნა", en: "Request a new link" },
} satisfies Record<string, Bilingual>;

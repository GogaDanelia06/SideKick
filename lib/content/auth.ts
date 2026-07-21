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
  submit: { ka: "რეგისტრაცია და ვერიფიკაცია", en: "Sign up & verify" },
  sent: {
    ka: "ვერიფიკაციის ბმული გამოგზავნილია მაილზე. ლინკზე დაჭერით ავტომატურად გადახვალ სამართავ პანელის დეშბორდზე.",
    en: "A verification link has been sent to your email. Clicking it takes you straight to your dashboard.",
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
} satisfies Record<string, Bilingual>;

import type { Bilingual } from "./types";

export type Package = {
  name: Bilingual;
  price: number;
  featured: boolean;
  features: Bilingual[];
};

export const PLAN_SUPPORT: Record<string, Bilingual> = {
  basic: { ka: "მხარდაჭერა: ელფოსტა", en: "Support: email" },
  standard: { ka: "მხარდაჭერა: პრიორიტეტული", en: "Support: priority" },
  premium: { ka: "მხარდაჭერა: 24/7 + პერსონალური", en: "Support: 24/7 + dedicated" },
};

export const PACKAGES_HEADING = {
  badge: { ka: "პაკეტები", en: "Packages" },
  title: { ka: "აირჩიე შენი გეგმა", en: "Choose your plan" },
};

export const PACKAGE_META = {
  popular: { ka: "პოპულარული", en: "Popular" },
};

export type BillingPeriod = {
  months: number;
  label: Bilingual;
  unit: Bilingual;
  discountPct: number;
};

export const BILLING_PERIODS: BillingPeriod[] = [
  { months: 1, label: { ka: "1 თვე", en: "1 month" }, unit: { ka: "₾ / თვე", en: "₾ / mo" }, discountPct: 0 },
  { months: 3, label: { ka: "3 თვე", en: "3 months" }, unit: { ka: "₾ / 3 თვე", en: "₾ / 3 mo" }, discountPct: 0 },
  { months: 12, label: { ka: "1 წელი", en: "1 year" }, unit: { ka: "₾ / წელი", en: "₾ / yr" }, discountPct: 0 },
];

export function periodPrice(monthly: number, period: BillingPeriod): number {
  return Math.round(monthly * period.months * (1 - period.discountPct / 100));
}

export const FREE_PERIOD = {
  badge: { ka: "უფასო პერიოდი — 30 დღე", en: "Free period — 30 days" },
  bannerTitle: {
    ka: "5 დღე სასტარტო პერიოდი + 30 დღე უფასო მომსახურება",
    en: "5-day starter period + 30 days of free service",
  },
  bannerText: {
    ka: "რეგისტრაციისთანავე იღებ სრულ წვდომას 5 დღით — არხების დაკავშირების ჩათვლით. შემდეგ ირჩევ პაკეტს და გადახდის მეთოდს, რის შემდეგაც გელოდება დამატებით 30 დღე სრულიად უფასოდ. თანხა ჩამოიჭრება მხოლოდ ამ პერიოდის დასრულების შემდეგ და გამოწერის გაუქმება ნებისმიერ დროს შეგიძლია.",
    en: "You get full access for 5 days the moment you register — including connecting channels. Then you choose a plan and a payment method, which unlocks a further 30 days completely free. You're only charged once that period ends, and you can cancel at any time.",
  },
  monthlyEquivalent: { ka: "თვეში", en: "per month" },
};

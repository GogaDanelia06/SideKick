import type { Bilingual } from "./types";

export type Package = {
  name: Bilingual;
  /** Monthly price. */
  price: number;
  /** Explicit multi-month prices. Null falls back to price × months, so a plan
   *  with no discount configured still shows a sensible number. */
  price3m: number | null;
  price12m: number | null;
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
};

export const BILLING_PERIODS: BillingPeriod[] = [
  { months: 1, label: { ka: "1 თვე", en: "1 month" }, unit: { ka: "₾ / თვე", en: "₾ / mo" } },
  { months: 3, label: { ka: "3 თვე", en: "3 months" }, unit: { ka: "₾ / 3 თვე", en: "₾ / 3 mo" } },
  { months: 12, label: { ka: "1 წელი", en: "1 year" }, unit: { ka: "₾ / წელი", en: "₾ / yr" } },
];

/** The price columns shared by the Plan row and the marketing Package. */
export type Priced = Pick<Package, "price" | "price3m" | "price12m">;

/** Price for a whole period: the term price when set, else monthly × months. Shared by pricing and checkout. */
export function periodPrice(pkg: Priced, months: number): number {
  if (months === 3 && pkg.price3m != null) return pkg.price3m;
  if (months === 12 && pkg.price12m != null) return pkg.price12m;
  return pkg.price * months;
}

/** Percentage saved against paying monthly, or 0 when there's no discount. */
export function periodSavingPct(pkg: Priced, months: number): number {
  if (months === 1) return 0;
  const full = pkg.price * months;
  const actual = periodPrice(pkg, months);
  if (full <= 0 || actual >= full) return 0;
  return Math.round((1 - actual / full) * 100);
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

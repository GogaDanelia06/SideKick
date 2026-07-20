import type { Bilingual } from "./types";

export type Package = {
  name: Bilingual;
  price: string;
  featured: boolean;
  features: Bilingual[];
};

export const PACKAGES_HEADING = {
  badge: { ka: "პაკეტები", en: "Packages" },
  title: { ka: "აირჩიე შენი გეგმა", en: "Choose your plan" },
  note: { ka: "პირველი თვე ყველა პაკეტზე უფასოა", en: "The first month is free on every plan" },
};

export const PACKAGE_META = {
  popular: { ka: "პოპულარული", en: "Popular" },
  unit: { ka: "₾ / თვე", en: "₾ / mo" },
};

export const PACKAGES: Package[] = [
  {
    name: { ka: "ბეისიქი", en: "Basic" },
    price: "49",
    featured: false,
    features: [
      { ka: "1,000 შეტყობინება / თვე", en: "1,000 messages / month" },
      { ka: "1 არხი", en: "1 channel" },
      { ka: "1 მომხმარებელი", en: "1 user" },
      { ka: "100 პროდუქტი", en: "100 products" },
      { ka: "მხარდაჭერა: ელფოსტა", en: "Support: email" },
    ],
  },
  {
    name: { ka: "სტანდარტი", en: "Standard" },
    price: "99",
    featured: true,
    features: [
      { ka: "10,000 შეტყობინება / თვე", en: "10,000 messages / month" },
      { ka: "3 არხი", en: "3 channels" },
      { ka: "5 მომხმარებელი", en: "5 users" },
      { ka: "1,000 პროდუქტი", en: "1,000 products" },
      { ka: "მხარდაჭერა: პრიორიტეტული", en: "Support: priority" },
    ],
  },
  {
    name: { ka: "პრემიუმი", en: "Premium" },
    price: "199",
    featured: false,
    features: [
      { ka: "შეუზღუდავი შეტყობინება", en: "Unlimited messages" },
      { ka: "ყველა არხი", en: "All channels" },
      { ka: "შეუზღუდავი მომხმარებელი", en: "Unlimited users" },
      { ka: "შეუზღუდავი პროდუქტი", en: "Unlimited products" },
      { ka: "მხარდაჭერა: 24/7 + პერსონალური", en: "Support: 24/7 + dedicated" },
    ],
  },
];

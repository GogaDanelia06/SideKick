import { ROUTES } from "@/lib/routes";
import type { Bilingual } from "./types";

type FooterLink = {
  label: Bilingual;
  href: string;
};

export const FOOTER = {
  tagline: {
    ka: "AI ასისტენტი, რომელიც პასუხობს, ყიდის და ზოგავს დროს — 24/7.",
    en: "An AI assistant that answers, sells and saves time — 24/7.",
  },

  company: {
    ka: 'შპს "საიდქიქ"',
    en: "Sidekick LLC",
  },

  aboutHeading: {
    ka: "ნავიგაცია",
    en: "Navigation",
  },

  infoHeading: {
    ka: "ინფორმაცია",
    en: "Information",
  },

  contactHeading: {
    ka: "კონტაქტი",
    en: "Contact",
  },

  aboutLinks: [
    { label: { ka: "ჩვენს შესახებ", en: "About us" }, href: ROUTES.about },
    {label: { ka: "ფასები", en: "Pricing" },href: `${ROUTES.pricing}#pricing`,},
    {label: { ka: "რეგისტრაცია / ლოგინ", en: "Sign up / Sign in" },href: ROUTES.account,},
    { label: { ka: "FAQ", en: "FAQ" }, href: `${ROUTES.contact}#faq` },
  ] satisfies FooterLink[],

  infoLinks: [
    {
      label: { ka: "წესები და პირობები", en: "Terms & conditions" },
      href: ROUTES.terms,
    },
    {
      label: { ka: "კონფიდენციალურობა", en: "Privacy policy" },
      href: ROUTES.privacy,
    },
    {
      label: { ka: "მონაცემთა დაცვა", en: "Data protection" },
      href: ROUTES.dataProtection,
    },

  ] satisfies FooterLink[],

  contactLabels: {
    email: { ka: "მეილი", en: "Email" },
    phone: { ka: "ტელეფონი", en: "Phone" },
  },

  copyright: {
    ka: "© 2026 Sidekick. ყველა უფლება დაცულია.",
    en: "© 2026 Sidekick. All rights reserved.",
  },
};

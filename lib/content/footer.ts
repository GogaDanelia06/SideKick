import { ROUTES } from "@/lib/routes";
import type { Bilingual } from "./types";

type FooterLink = {
  label: Bilingual;
  href: string;
};

type ContactLine = {
  label: Bilingual;
  value: string;
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
    ka: "ჩვენს შესახებ",
    en: "About us",
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
        {
      label: { ka: "რეგისტრაცია / ლოგინ", en: "Sign up / Sign in" },
      href: ROUTES.account,
    },
    { label: { ka: "ფასები", en: "Pricing" }, href: ROUTES.pricing },
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

  contact: [
    {
      label: { ka: "მეილი", en: "Email" },
      value: "sidekick@gmail.com",
      href: "mailto:sidekick@gmail.com",
    },
    {
      label: { ka: "ტელეფონი", en: "Phone" },
      value: "599 99 99 99",
      href: "tel:+995599999999",
    },
    {
      label: { ka: "Facebook", en: "Facebook" },
      value: "Sidekick.ge",
      href: "https://www.facebook.com/Sidekick.ge",
    },
    {
      label: { ka: "Instagram", en: "Instagram" },
      value: "@sidekickge",
      href: "https://www.instagram.com/sidekickge/",
    },
  ] satisfies ContactLine[],

  copyright: {
    ka: "© 2026 Sidekick. ყველა უფლება დაცულია.",
    en: "© 2026 Sidekick. All rights reserved.",
  },
};
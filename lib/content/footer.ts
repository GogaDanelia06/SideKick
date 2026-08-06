import { ROUTES } from "@/lib/routes";
import type { Bilingual } from "./types";

type FooterLink = { label: Bilingual; href: string };
type ContactLine = { label: Bilingual; value: string; href: string };

export const FOOTER = {
  tagline: {
    ka: "AI ასისტენტი, რომელიც პასუხობს, ყიდის და ზოგავს დროს — 24/7.",
    en: "An AI assistant that answers, sells and saves time — 24/7.",
  },
  company: { ka: 'შპს "საიდქიქ"', en: "Sidekick LLC" },
  contact: [
    { label: { ka: "მეილი", en: "Email" }, value: "sidekick@gmail.com", href: "mailto:sidekick@gmail.com" },
    { label: { ka: "ტელეფონი", en: "Phone" }, value: "599 99 99 99", href: "tel:+995599999999" },
    { label: { ka: "სოც ქსელები", en: "Social" }, value: "FB / INSTA / Whatsapp", href: "#" },
  ] satisfies ContactLine[],
  linksHeading: { ka: "ჩვენს შესახებ", en: "About" },
  links: [
    { label: { ka: "ფასები", en: "Pricing" }, href: ROUTES.pricing },
    // Jumps to the FAQ block on the contact page — see components/contact/Faq.tsx
    { label: { ka: "ხშირად დასმული კითხვები", en: "Frequently asked questions" }, href: `${ROUTES.contact}#faq` },
    { label: { ka: "წესები და პირობები", en: "Terms & conditions" }, href: ROUTES.terms },
    { label: { ka: "კონფიდენციალურობა", en: "Privacy policy" }, href: ROUTES.privacy },
    { label: { ka: "მონაცემთა დაცვა", en: "Data protection" }, href: ROUTES.dataProtection },
    // Not /register: the label offers signing in too, and a customer who
    // already has an account was being shown a sign-up form. /account sends
    // them to the dashboard and everyone else to the login page, which has its
    // own link across to registration.
    { label: { ka: "რეგისტრაცია / ლოგინ", en: "Sign up / Sign in" }, href: ROUTES.account },
  ] satisfies FooterLink[],
  copyright: {
    ka: "© 2026 Sidekick. ყველა უფლება დაცულია.",
    en: "© 2026 Sidekick. All rights reserved.",
  },
};

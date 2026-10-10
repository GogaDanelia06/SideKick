import { ka, type TextGroup } from "./types";

export const ABOUT: TextGroup = {
  slug: "about",
  title: ka("ჩვენ შესახებ", "About us"),
  page: ka("ჩვენ შესახებ გვერდი", "About page"),
  fields: [
    { key: "about_title", label: ka("სათაური", "Title"), kind: "short" },
    { key: "about_body", label: ka("ტექსტი", "Text"), kind: "long" },
    {
      key: "about_image",
      label: ka("ფოტო", "Photo"),
      kind: "media",
      singleLang: true,
      hint: ka(
        "რეკომენდებული: 1600×500 (განივი). სურათი მოიჭრება ჩარჩოს შესავსებად.",
        "Recommended: 1600×500 (landscape). The image is cropped to fill the frame.",
      ),
    },
  ],
};

export const CONTACT: TextGroup = {
  slug: "contact",
  title: ka("საკონტაქტო ინფორმაცია", "Contact details"),
  page: ka("კონტაქტის გვერდი და ფუტერი", "Contact page & footer"),
  fields: [
    { key: "contact_email", label: ka("ელფოსტა", "Email"), kind: "email", singleLang: true },
    { key: "contact_phone", label: ka("ტელეფონი", "Phone"), kind: "tel", singleLang: true },
    { key: "social_facebook", label: ka("Facebook", "Facebook"), kind: "url", singleLang: true },
    { key: "social_instagram", label: ka("Instagram", "Instagram"), kind: "url", singleLang: true },
    { key: "social_whatsapp", label: ka("WhatsApp", "WhatsApp"), kind: "url", singleLang: true },
    { key: "social_linkedin", label: ka("LinkedIn", "LinkedIn"), kind: "url", singleLang: true },
  ],
};

export const PRICING: TextGroup = {
  slug: "pricing-heading",
  title: ka("სექციის სათაური", "Section heading"),
  page: ka("ფასების გვერდი", "Pricing page"),
  fields: [
    {
      key: "pricing_badge",
      label: ka("ბეჯი", "Badge"),
      kind: "short",
    },
    {
      key: "pricing_h1",
      label: ka("სათაური (H1)", "Heading (H1)"),
      kind: "short",
      hint: ka(
        "გვერდის მთავარი სათაური — ეს არის H1, რომელსაც Google კითხულობს.",
        "The page's main heading — this is the H1 that Google reads.",
      ),
    },
    { key: "pricing_sub", label: ka("ქვესათაური", "Subheading"), kind: "short" },
  ],
};

export const CONTACT_HEADING: TextGroup = {
  slug: "contact-heading",
  title: ka("სექციის სათაური", "Section heading"),
  page: ka("კონტაქტის გვერდი", "Contact page"),
  fields: [
    { key: "contact_badge", label: ka("ბეჯი", "Badge"), kind: "short" },
    {
      key: "contact_h1",
      label: ka("სათაური (H1)", "Heading (H1)"),
      kind: "short",
      hint: ka(
        "გვერდის მთავარი სათაური — ეს არის H1, რომელსაც Google კითხულობს.",
        "The page's main heading — this is the H1 that Google reads.",
      ),
    },
    { key: "contact_sub", label: ka("ქვესათაური", "Subheading"), kind: "short" },
  ],
};

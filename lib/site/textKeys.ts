import type { Bilingual } from "@/lib/content/types";

/**
 * Every editable text on the public site, in one registry.
 *
 * Each entry maps a stable key to where it appears, what it is called in the
 * admin UI, and how it should be edited. The admin screens are generated from
 * this list — adding a new editable field costs one entry here, not a new
 * table, migration, screen and action.
 *
 * `fallback` is what the site shows when the key has never been saved. It
 * points at the existing hardcoded copy, so the site is never blank.
 */

export type TextField = {
  key: string;
  label: Bilingual;
  /** `long` renders a textarea, `short` an input, `url`/`email`/`tel` are single-line with hints. */
  kind: "short" | "long" | "url" | "email" | "tel";
  /** Only Georgian is edited for this key (e.g. a phone number or a URL). */
  singleLang?: boolean;
  hint?: Bilingual;
};

export type TextGroup = {
  /** Admin route segment, e.g. /admin/content/story */
  slug: string;
  title: Bilingual;
  /** Which public page this group drives — shown to the admin for orientation. */
  page: Bilingual;
  description?: Bilingual;
  fields: TextField[];
};

const ka = (ka: string, en: string): Bilingual => ({ ka, en });

/* ── #4 Story ───────────────────────────────────────────────────────────── */

const STORY: TextGroup = {
  slug: "story",
  title: ka("ისტორიის სექცია", "Story section"),
  page: ka("მთავარი გვერდი", "Landing page"),
  fields: [
    { key: "story_title", label: ka("სათაური", "Title"), kind: "short" },
    { key: "story_body", label: ka("ტექსტი", "Text"), kind: "long" },
  ],
};

/* ── #6 CTA banner ──────────────────────────────────────────────────────── */

const CTA: TextGroup = {
  slug: "cta",
  title: ka("„დარწმუნდი სანამ გადაიხდი“", "“See results before you pay”"),
  page: ka("მთავარი გვერდი", "Landing page"),
  fields: [
    { key: "cta_badge", label: ka("ბეჯი", "Badge"), kind: "short" },
    { key: "cta_title", label: ka("სათაური", "Title"), kind: "short" },
    { key: "cta_text", label: ka("ტექსტი", "Text"), kind: "long" },
    { key: "cta_button", label: ka("ღილაკის წარწერა", "Button label"), kind: "short" },
    {
      key: "cta_url",
      label: ka("ღილაკის ბმული", "Button URL"),
      kind: "url",
      singleLang: true,
      hint: ka("მაგ. /register", "e.g. /register"),
    },
  ],
};

/* ── #9 + #12 Free period ───────────────────────────────────────────────── */

const FREE_PERIOD: TextGroup = {
  slug: "free-period",
  title: ka("უფასო პერიოდის სექცია", "Free-period section"),
  page: ka("ფასების და რეგისტრაციის გვერდი", "Pricing & registration pages"),
  description: ka(
    "ერთი ტექსტი ორივე გვერდისთვის — ფასების გვერდზე ბოქსების ქვემოთ და რეგისტრაციის გვერდზე.",
    "One text for both pages — under the pricing cards and on the registration page.",
  ),
  fields: [
    { key: "free_badge", label: ka("ბეჯი (პაკეტის ბარათზე)", "Badge (on plan cards)"), kind: "short" },
    { key: "free_title", label: ka("სათაური", "Title"), kind: "short" },
    { key: "free_text", label: ka("ტექსტი", "Text"), kind: "long" },
  ],
};

/* ── #10 About ──────────────────────────────────────────────────────────── */

const ABOUT: TextGroup = {
  slug: "about",
  title: ka("ჩვენ შესახებ", "About us"),
  page: ka("ჩვენ შესახებ გვერდი", "About page"),
  fields: [
    { key: "about_title", label: ka("სათაური", "Title"), kind: "short" },
    { key: "about_body", label: ka("ტექსტი", "Text"), kind: "long" },
    {
      key: "about_image",
      label: ka("ფოტოს ბმული", "Photo URL"),
      kind: "url",
      singleLang: true,
      hint: ka("ატვირთვა მალე დაემატება — ჯერ ბმული ჩასვი", "Upload coming soon — paste a URL for now"),
    },
  ],
};

/* ── #11 Contact ────────────────────────────────────────────────────────── */

const CONTACT: TextGroup = {
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

/* ── Pricing heading ────────────────────────────────────────────────────── */

const PRICING: TextGroup = {
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

export const TEXT_GROUPS: TextGroup[] = [STORY, CTA, FREE_PERIOD, ABOUT, CONTACT, PRICING];

/* ── #13–15 Legal ───────────────────────────────────────────────────────── */

/**
 * The three legal documents. These get their own screens rather than a generic
 * text group: each is a list of numbered sections (heading + paragraphs +
 * bullets) and that structure is what makes them readable, so it is edited
 * section by section instead of as one giant blob.
 */
export type LegalDocMeta = { doc: string; title: Bilingual; route: string };

export const LEGAL_DOCS: LegalDocMeta[] = [
  { doc: "terms", title: ka("წესები და პირობები", "Terms & conditions"), route: "/terms" },
  { doc: "privacy", title: ka("კონფიდენციალურობა", "Privacy policy"), route: "/privacy" },
  {
    doc: "data-protection",
    title: ka("პერსონალურ მონაცემთა დაცვა", "Personal data protection"),
    route: "/data-protection",
  },
];

export function findLegalDoc(doc: string): LegalDocMeta | undefined {
  return LEGAL_DOCS.find((d) => d.doc === doc);
}

export function findGroup(slug: string): TextGroup | undefined {
  return TEXT_GROUPS.find((g) => g.slug === slug);
}

/** Every key the registry owns — used to validate what an action may write. */
export const ALL_TEXT_KEYS: string[] = TEXT_GROUPS.flatMap((g) => g.fields.map((f) => f.key));

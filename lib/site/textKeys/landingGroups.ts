import { ka, type TextGroup } from "./types";

export const STORY: TextGroup = {
  slug: "story",
  title: ka("ისტორიის სექცია", "Story section"),
  page: ka("მთავარი გვერდი", "Landing page"),
  fields: [
    { key: "story_title", label: ka("სათაური", "Title"), kind: "short" },
    { key: "story_body", label: ka("ტექსტი", "Text"), kind: "long" },
  ],
};

export const CTA: TextGroup = {
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
      hint: ka(
        "ცარიელი = /start — ავტორიზებულს პირდაპირ ბილინგში გადაიყვანს, დანარჩენს ჯერ რეგისტრაციაზე.",
        "Blank = /start — signed-in visitors go straight to billing, everyone else registers first.",
      ),
    },
  ],
};

export const FREE_PERIOD: TextGroup = {
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

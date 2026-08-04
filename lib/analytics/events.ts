/**
 * Every event the site is allowed to record.
 *
 * The list is closed on purpose: `/api/track` is a public endpoint, so an
 * open-ended `name` field would let anyone fill the table with junk. An unknown
 * name is dropped rather than stored.
 *
 * Nothing here identifies a person. We keep an event name, the page it happened
 * on, the day, and a count — no IP address, no user id, no cookie. That is what
 * lets the site run this without a consent banner, and it is also why these
 * numbers can never be turned into "what did this particular visitor do".
 */

import type { Bilingual } from "@/lib/content/types";

const ka = (ka: string, en: string): Bilingual => ({ ka, en });

export type TrackedEvent = {
  name: string;
  label: Bilingual;
  /** Groups the event in the admin panel. */
  group: "traffic" | "funnel" | "engagement";
};

export const TRACKED_EVENTS: TrackedEvent[] = [
  { name: "page_view", label: ka("გვერდის ნახვა", "Page views"), group: "traffic" },

  {
    name: "registration_started",
    label: ka("რეგისტრაცია დაიწყო", "Registration started"),
    group: "funnel",
  },
  {
    name: "registration_completed",
    label: ka("რეგისტრაცია დასრულდა", "Registration completed"),
    group: "funnel",
  },
  {
    name: "pricing_plan_selected",
    label: ka("პაკეტი აირჩია", "Pricing plan selected"),
    group: "funnel",
  },
  {
    name: "dashboard_button_click",
    label: ka("დეშბორდის ღილაკი", "Dashboard button click"),
    group: "funnel",
  },

  {
    name: "chat_widget_opened",
    label: ka("ჩატი გაიხსნა", "Chat widget opened"),
    group: "engagement",
  },
  {
    name: "chat_conversation_started",
    label: ka("ჩატში წერა დაიწყო", "Chat conversation started"),
    group: "engagement",
  },
  { name: "language_changed", label: ka("ენა შეიცვალა", "Language changed"), group: "engagement" },
  { name: "theme_change", label: ka("თემა შეიცვალა", "Theme changed"), group: "engagement" },
  { name: "footer_link_click", label: ka("ფუტერის ბმული", "Footer link click"), group: "engagement" },
];

export const EVENT_NAMES: string[] = TRACKED_EVENTS.map((e) => e.name);

export function findEvent(name: string): TrackedEvent | undefined {
  return TRACKED_EVENTS.find((e) => e.name === name);
}

/** Extra fields a client may send. Anything else is ignored. */
export type EventProps = {
  /** For footer_link_click. */
  link_name?: string;
  link_url?: string;
  link_type?: string;
  /** For pricing_plan_selected. */
  plan?: string;
};

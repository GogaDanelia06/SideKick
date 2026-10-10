import type { Text } from "@/lib/i18n/messages";

const ka = (ka: string, en: string): Text => ({ ka, en });

export type TrackedEvent = {
  name: string;
  label: Text;
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

export type EventProps = {
  link_name?: string;
  link_url?: string;
  link_type?: string;
  plan?: string;
};

import type { Bilingual } from "@/lib/content/types";
import { DASH } from "./routes";

export type DashMeta = { title: Bilingual; subtitle: Bilingual };

/** Topbar title + subtitle per route (looked up by pathname). */
export const DASH_META: Record<string, DashMeta> = {
  [DASH.home]: { title: { ka: "Dashboard", en: "Dashboard" }, subtitle: { ka: "მთავარი მიმოხილვა", en: "Overview" } },
  [DASH.conversations]: { title: { ka: "მიმოწერები", en: "Conversations" }, subtitle: { ka: "ყველა ჩათი ერთ სივრცეში", en: "Every chat in one place" } },
  [DASH.ai]: { title: { ka: "AI ასისტენტი", en: "AI assistant" }, subtitle: { ka: "ბოტის კონფიგურაცია", en: "Bot configuration" } },
  [DASH.channels]: { title: { ka: "არხები", en: "Channels" }, subtitle: { ka: "ინტეგრაციები", en: "Integrations" } },
  [DASH.products]: { title: { ka: "პროდუქტები / საწყობი", en: "Products / inventory" }, subtitle: { ka: "მარაგის მართვა", en: "Stock management" } },
  [DASH.orders]: { title: { ka: "შეკვეთები", en: "Orders" }, subtitle: { ka: "შეკვეთების მართვა", en: "Order management" } },
  [DASH.leads]: { title: { ka: "ლიდები", en: "Leads" }, subtitle: { ka: "პოტენციური კლიენტები", en: "Potential customers" } },
  [DASH.analytics]: { title: { ka: "ანალიტიკა", en: "Analytics" }, subtitle: { ka: "დეტალური სტატისტიკა", en: "Detailed statistics" } },
  [DASH.team]: { title: { ka: "გუნდი", en: "Team" }, subtitle: { ka: "წევრები და როლები", en: "Members and roles" } },
  [DASH.billing]: { title: { ka: "ბილინგი", en: "Billing" }, subtitle: { ka: "გამოწერა და გადახდები", en: "Subscription and payments" } },
  [DASH.videos]: { title: { ka: "ვიდეო ინსტრუქციები", en: "Tutorials" }, subtitle: { ka: "სახელმძღვანელო", en: "Guides" } },
  [DASH.profile]: { title: { ka: "პროფილი", en: "Profile" }, subtitle: { ka: "პირადი ინფორმაცია", en: "Personal information" } },
};

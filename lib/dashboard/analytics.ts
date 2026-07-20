import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconCash,
  IconShoppingCart,
  IconUserPlus,
  IconWorld,
} from "@tabler/icons-react";
import type { Bilingual, IconType } from "@/lib/content/types";

export const RANGES: Bilingual[] = [
  { ka: "1 კვირა", en: "1 week" },
  { ka: "1 თვე", en: "1 month" },
  { ka: "3 თვე", en: "3 months" },
  { ka: "6 თვე", en: "6 months" },
  { ka: "1 წელი", en: "1 year" },
];

export type AnalyticsKpi = { label: Bilingual; value: string; delta: string; up: boolean };
export const ANALYTICS_KPIS: AnalyticsKpi[] = [
  { label: { ka: "მიმოწერები", en: "Conversations" }, value: "8,540", delta: "+14%", up: true },
  { label: { ka: "ლიდები", en: "Leads" }, value: "312", delta: "+9%", up: true },
  { label: { ka: "გაყიდვები", en: "Sales" }, value: "168", delta: "−3%", up: false },
  { label: { ka: "შემოსავალი", en: "Revenue" }, value: "48,200₾", delta: "+18%", up: true },
];

export const CHART_BARS = [48, 62, 54, 78, 70, 88, 74, 96];

const CH = {
  ig: { name: "Instagram", icon: IconBrandInstagram, color: "#c13584" },
  wa: { name: "WhatsApp", icon: IconBrandWhatsapp, color: "#25d366" },
  fb: { name: "Facebook", icon: IconBrandFacebook, color: "#1877f2" },
  web: { name: "Website", icon: IconWorld, color: "#58a6ff" },
} as const;

export type ChannelRow = { name: string; icon: IconType; color: string; value: string; width: number };
export type ChannelBox = { label: Bilingual; icon: IconType; rows: ChannelRow[] };
const row = (c: (typeof CH)[keyof typeof CH], value: string, width: number): ChannelRow => ({ ...c, value, width });

export const CHANNEL_BOXES: ChannelBox[] = [
  { label: { ka: "შემოსავალი", en: "Revenue" }, icon: IconCash, rows: [row(CH.ig, "24,800₾", 100), row(CH.fb, "12,400₾", 50), row(CH.wa, "7,600₾", 31), row(CH.web, "3,400₾", 14)] },
  { label: { ka: "შეკვეთები", en: "Orders" }, icon: IconShoppingCart, rows: [row(CH.wa, "68", 100), row(CH.ig, "52", 76), row(CH.fb, "34", 50), row(CH.web, "14", 21)] },
  { label: { ka: "ლიდები", en: "Leads" }, icon: IconUserPlus, rows: [row(CH.ig, "134", 100), row(CH.wa, "89", 66), row(CH.fb, "61", 46), row(CH.web, "28", 21)] },
];

export type TopProduct = { rank: number; name: string; sold: string; rev: string };
export const TOP_PRODUCTS: TopProduct[] = [
  { rank: 1, name: "თეთრი კაბა", sold: "48", rev: "7,632₾" },
  { rank: 2, name: "AirPods Pro", sold: "34", rev: "22,066₾" },
  { rank: 3, name: "ტყავის ჩანთა", sold: "27", rev: "10,260₾" },
  { rank: 4, name: "სპორტული ფეხსაცმელი", sold: "21", rev: "4,179₾" },
  { rank: 5, name: "iPhone 15 Pro", sold: "12", rev: "42,000₾" },
];

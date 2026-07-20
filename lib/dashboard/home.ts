import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconCash,
  IconMessage2,
  IconShoppingCart,
  IconUserPlus,
  IconWorld,
} from "@tabler/icons-react";
import type { Bilingual, IconType } from "@/lib/content/types";
import type { Tone } from "./tone";

export type Kpi = { label: Bilingual; icon: IconType; value: string; delta: string };
export const KPIS: Kpi[] = [
  { label: { ka: "დღევანდელი მიმოწერები", en: "Today's conversations" }, icon: IconMessage2, value: "248", delta: "+12%" },
  { label: { ka: "ახალი ლიდები", en: "New leads" }, icon: IconUserPlus, value: "34", delta: "+8%" },
  { label: { ka: "ახალი შეკვეთები", en: "New orders" }, icon: IconShoppingCart, value: "19", delta: "+5%" },
  { label: { ka: "შემოსავალი", en: "Revenue" }, icon: IconCash, value: "4,280₾", delta: "+18%" },
];

export const LIMIT = {
  heading: { ka: "დარჩენილი შეტყობინებების ლიმიტი", en: "Remaining message limit" },
  plan: { ka: "Standard · 10,000 / თვე", en: "Standard · 10,000 / mo" },
  remaining: "6,420",
  used: { ka: "დარჩა · 3,580 გამოყენებული", en: "left · 3,580 used" },
  percent: 64,
  reset: { ka: "განულდება 1 აგვისტოს", en: "Resets Aug 1" },
};

export type ChannelStat = { name: string; icon: IconType; tone: Tone; state: Bilingual };
export const CHANNEL_STATUS: ChannelStat[] = [
  { name: "Facebook", icon: IconBrandFacebook, tone: "green", state: { ka: "აქტიური", en: "Active" } },
  { name: "Instagram", icon: IconBrandInstagram, tone: "green", state: { ka: "აქტიური", en: "Active" } },
  { name: "WhatsApp", icon: IconBrandWhatsapp, tone: "amber", state: { ka: "ხარვეზია", en: "Issue" } },
  { name: "Website API", icon: IconWorld, tone: "red", state: { ka: "გათიშული", en: "Offline" } },
];

export type StoppedMsg = { icon: IconType; user: string; text: string; reason: Bilingual; tone: Tone; time: string };
export const STOPPED_MSGS: StoppedMsg[] = [
  { icon: IconBrandWhatsapp, user: "გიორგი მ.", text: "შეკვეთის სტატუსი მაინტერესებს #1043", reason: { ka: "არხი შეფერხდა", en: "Channel delayed" }, tone: "amber", time: "2 წთ" },
  { icon: IconBrandInstagram, user: "ანა ბ.", text: "გამარჯობა, ფასი მაინტერესებს", reason: { ka: "ლიმიტი ამოიწურა", en: "Limit reached" }, tone: "red", time: "14 წთ" },
  { icon: IconBrandFacebook, user: "ლევან თ.", text: "მადლობა! 🙏", reason: { ka: "AI გათიშულია", en: "AI off" }, tone: "muted", time: "1 სთ" },
];

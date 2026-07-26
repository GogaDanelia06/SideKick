import {
  IconCash,
  IconMessage2,
  IconShoppingCart,
  IconUserPlus,
} from "@tabler/icons-react";
import type { ChannelStatus } from "@prisma/client";
import type { Bilingual, IconType } from "@/lib/content/types";
import type { Tone } from "./tone";

export type KpiKey = "conversations" | "leads" | "orders" | "revenue";

export const KPI_META: { key: KpiKey; label: Bilingual; icon: IconType; money?: boolean }[] = [
  { key: "conversations", label: { ka: "დღევანდელი მიმოწერები", en: "Today's conversations" }, icon: IconMessage2 },
  { key: "leads", label: { ka: "ახალი ლიდები", en: "New leads" }, icon: IconUserPlus },
  { key: "orders", label: { ka: "ახალი შეკვეთები", en: "New orders" }, icon: IconShoppingCart },
  { key: "revenue", label: { ka: "შემოსავალი", en: "Revenue" }, icon: IconCash, money: true },
];

export const LIMIT_LABELS = {
  heading: { ka: "დარჩენილი შეტყობინებების ლიმიტი", en: "Remaining message limit" },
  left: { ka: "დარჩა", en: "left" },
  used: { ka: "გამოყენებული", en: "used" },
  noPlan: { ka: "აქტიური პაკეტი არ არის", en: "No active plan" },
  unlimited: { ka: "ულიმიტო", en: "Unlimited" },
  renews: { ka: "განახლდება", en: "Renews" },
};

export const CHANNEL_STATE: Record<ChannelStatus, { tone: Tone; label: Bilingual }> = {
  ACTIVE: { tone: "green", label: { ka: "აქტიური", en: "Active" } },
  DELAYED: { tone: "amber", label: { ka: "ხარვეზია", en: "Issue" } },
  OFF: { tone: "red", label: { ka: "გათიშული", en: "Offline" } },
};

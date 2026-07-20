import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconInbox,
  IconWorld,
} from "@tabler/icons-react";
import type { Bilingual, IconType } from "@/lib/content/types";

export type ConvFilter = { label: Bilingual; icon: IconType };
export const CONV_FILTERS: ConvFilter[] = [
  { label: { ka: "ყველა", en: "All" }, icon: IconInbox },
  { label: { ka: "Facebook", en: "Facebook" }, icon: IconBrandFacebook },
  { label: { ka: "Instagram", en: "Instagram" }, icon: IconBrandInstagram },
  { label: { ka: "WhatsApp", en: "WhatsApp" }, icon: IconBrandWhatsapp },
  { label: { ka: "Website", en: "Website" }, icon: IconWorld },
];

/** Avatar ring = intent (lead/order); alert = why the bot paused. */
export type Ring = "lead" | "order" | "none";
export type Alert = "wait" | "aierr" | "aioff" | "none";

export type Chat = {
  initials: string;
  name: string;
  channel: IconType;
  channelColor: string;
  ring: Ring;
  alert: Alert;
  preview: string;
  time: string;
};

export const CHATS: Chat[] = [
  { initials: "ნკ", name: "ნინო კ.", channel: IconBrandInstagram, channelColor: "#c13584", ring: "order", alert: "wait", preview: "კი, M ზომა მინდა", time: "ახლა" },
  { initials: "გმ", name: "გიორგი მ.", channel: IconBrandWhatsapp, channelColor: "#25d366", ring: "lead", alert: "aierr", preview: "შეკვეთის სტატუსი #1043", time: "2 წთ" },
  { initials: "ბდ", name: "ბექა დ.", channel: IconBrandFacebook, channelColor: "#1877f2", ring: "order", alert: "none", preview: "გმადლობთ, შევუკვეთავ", time: "9 წთ" },
  { initials: "ას", name: "ანა ს.", channel: IconBrandInstagram, channelColor: "#c13584", ring: "lead", alert: "wait", preview: "ფასდაკლება არის?", time: "22 წთ" },
  { initials: "თლ", name: "თამარ ლ.", channel: IconWorld, channelColor: "#58a6ff", ring: "none", alert: "aioff", preview: "მიწოდება რამდენ დღეში?", time: "1 სთ" },
  { initials: "დკ", name: "დათო კ.", channel: IconBrandWhatsapp, channelColor: "#25d366", ring: "none", alert: "none", preview: "დასრულდა — გმადლობთ", time: "3 სთ" },
];

export type ThreadMsg = { from: "customer" | "ai" | "admin"; text: string };
export const THREAD: ThreadMsg[] = [
  { from: "customer", text: "გამარჯობა, ეს კაბა თეთრ ფერში გაქვთ? 👗" },
  { from: "ai", text: "დიახ! თეთრი ფერი მარაგშია — ზომები S, M, L. ღირს 189₾. გსურთ შეკვეთა?" },
  { from: "customer", text: "კი, M ზომა მინდა" },
  { from: "admin", text: "შესანიშნავია! გთხოვთ მისამართი და ტელეფონი მიწოდებისთვის." },
];

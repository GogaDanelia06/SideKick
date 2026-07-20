import type { Bilingual } from "@/lib/content/types";

export type OrderTab = { key: string; label: Bilingual; count: string };
export const ORDER_TABS: OrderTab[] = [
  { key: "new", label: { ka: "ახალი", en: "New" }, count: "19" },
  { key: "send", label: { ka: "გასაგზავნი", en: "To ship" }, count: "7" },
  { key: "done", label: { ka: "დასრულებული", en: "Done" }, count: "142" },
  { key: "cancel", label: { ka: "გაუქმებული", en: "Cancelled" }, count: "4" },
  { key: "problem", label: { ka: "პრობლემური", en: "Issues" }, count: "2" },
];

export type Order = {
  id: string;
  name: string;
  phone: string;
  total: string;
  date: string;
  time: string;
  addr: string;
};

export const ORDERS: Order[] = [
  { id: "#1043", name: "ნინო კ.", phone: "+995 599 12 34 56", total: "189₾", date: "07 ივლ 2026", time: "14:32", addr: "თბილისი, ვაჟა-ფშაველა 12" },
  { id: "#1042", name: "გიორგი მ.", phone: "+995 577 88 77 66", total: "420₾", date: "07 ივლ 2026", time: "11:05", addr: "ბათუმი, ჭავჭავაძის 45" },
  { id: "#1041", name: "ბექა დ.", phone: "+995 555 33 22 11", total: "95₾", date: "06 ივლ 2026", time: "19:47", addr: "ქუთაისი, თამარ მეფის 8" },
  { id: "#1040", name: "ანა ს.", phone: "+995 598 44 55 66", total: "310₾", date: "06 ივლ 2026", time: "09:18", addr: "თბილისი, პეკინის 3" },
];

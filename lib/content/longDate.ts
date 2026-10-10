import type { Locale } from "@/lib/i18n/types";

const MONTHS: Record<Locale, string[]> = {
  ka: ["იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი",
       "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"],
  en: ["January", "February", "March", "April", "May", "June",
       "July", "August", "September", "October", "November", "December"],
};

const PARTS = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tbilisi",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function longDate(value: string | Date | number, locale: Locale): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const [year, month, day] = PARTS.format(date).split("-");
  const name = MONTHS[locale][Number(month) - 1];
  return locale === "ka" ? `${Number(day)} ${name}, ${year}` : `${Number(day)} ${name} ${year}`;
}

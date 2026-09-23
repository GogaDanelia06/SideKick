import type { Locale } from "@/lib/i18n/types";

/**
 * A date written out in words, the same everywhere.
 *
 * `toLocaleDateString("ka-GE", …)` depends on the locale data the runtime happens to
 * carry: Node writes „22 ივლისი", a browser without Georgian writes "July 22" — and React
 * then tears the page down and renders it again, because the two do not match. The month
 * names live here instead, and only the numbers come from the platform.
 */
const MONTHS: Record<Locale, string[]> = {
  ka: ["იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი",
       "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"],
  en: ["January", "February", "March", "April", "May", "June",
       "July", "August", "September", "October", "November", "December"],
};

/** Year-month-day in the shop's timezone; the numbers read the same in every runtime. */
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

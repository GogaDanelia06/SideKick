/**
 * The one clock the dashboard reads.
 *
 * Fixed to Tbilisi rather than the viewer's machine, on purpose. A shop's
 * orders and messages happened in shop time, and an owner checking their inbox
 * from a trip should see the hour their customer wrote, not the hour it was
 * where they are standing. Formatting on the server also keeps a Date from
 * crossing to the browser and being rendered differently there than here.
 */
const TZ = "Asia/Tbilisi";

export const fmtDate = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: TZ,
});

export const fmtTime = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TZ,
});

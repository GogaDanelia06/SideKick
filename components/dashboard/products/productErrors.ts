import type { Bilingual } from "@/lib/content/types";
import type { ResizeError } from "@/lib/products/resizePhoto";

/** Why the server did not save a product; the photo ones come from lib/products/photo.ts. */
export const PRODUCT_ERRORS: Record<string, Bilingual> = {
  missing: { ka: "დასახელება და კოდი სავალდებულოა.", en: "Name and code are required." },
  duplicate: {
    ka: "ეს კოდი უკვე გაქვს სხვა პროდუქტზე. მიუთითე სხვა.",
    en: "That code is already used by another product. Pick a different one.",
  },
  limit: {
    ka: "შენი გეგმა მეტ პროდუქტს არ უშვებს. წაშალე რამე ან გეგმა შეცვალე.",
    en: "Your plan does not allow more products. Delete one, or change the plan.",
  },
  forbidden: { ka: "პროდუქტის შეცვლის უფლება არ გაქვს.", en: "You may not change products." },
  photo_type: { ka: "ფოტო უნდა იყოს JPG, PNG ან WebP.", en: "The photo must be a JPG, PNG or WebP." },
  photo_size: { ka: "ფოტო ძალიან დიდია.", en: "The photo is too large." },
  photo_storage: {
    ka: "ფოტოების საცავი ჯერ არ არის მოწყობილი. შეინახე ფოტოს გარეშე.",
    en: "Photo storage is not set up yet. Save without a photo for now.",
  },
  error: { ka: "ვერ შეინახა. სცადე ხელახლა.", en: "Could not save it. Try again." },
};

/** Problems found in the browser, before anything is sent. */
export const PHOTO_ERRORS: Record<ResizeError, Bilingual> = {
  unreadable: {
    ka: "ამ ფაილს ვერ ვკითხულობ. აირჩიე JPG, PNG ან WebP ფოტო.",
    en: "This file can't be read. Choose a JPG, PNG or WebP photo.",
  },
  too_large: {
    ka: "ფოტო შემცირების შემდეგაც ძალიან დიდია. სცადე სხვა.",
    en: "The photo is too large even after shrinking. Try another one.",
  },
};

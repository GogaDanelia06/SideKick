import type { Bilingual } from "./types";

/** Copy for the 404 page (app/not-found.tsx). */
export const NOT_FOUND: {
  code: string;
  title: Bilingual;
  text: Bilingual;
  home: Bilingual;
  contact: Bilingual;
} = {
  code: "404",
  title: { ka: "გვერდი ვერ მოიძებნა", en: "Page not found" },
  text: {
    ka: "სამწუხაროდ, გვერდი რომელსაც ეძებთ არ არსებობს ან გადატანილია. შეამოწმეთ მისამართი ან დაბრუნდით მთავარ გვერდზე.",
    en: "The page you're looking for doesn't exist or has been moved. Check the address, or head back to the homepage.",
  },
  home: { ka: "მთავარ გვერდზე", en: "Back to home" },
  contact: { ka: "დაგვიკავშირდით", en: "Contact us" },
};

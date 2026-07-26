import type { Bilingual } from "./types";

export const ERROR_PAGE: {
  title: Bilingual;
  text: Bilingual;
  retry: Bilingual;
  home: Bilingual;
  idLabel: Bilingual;
} = {
  title: { ka: "რაღაც შეფერხდა", en: "Something went wrong" },
  text: {
    ka: "გვერდის ჩატვირთვისას მოხდა შეცდომა. სცადეთ თავიდან — თუ პრობლემა გრძელდება, დაგვიკავშირდით და მიუთითეთ ქვემოთ მოცემული კოდი.",
    en: "An error occurred while loading this page. Try again — if the problem continues, contact us and quote the code below.",
  },
  retry: { ka: "თავიდან ცდა", en: "Try again" },
  home: { ka: "მთავარ გვერდზე", en: "Back to home" },
  idLabel: { ka: "შეცდომის კოდი", en: "Error code" },
};

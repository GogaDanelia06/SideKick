import type { Bilingual } from "./types";

/** A paragraph whose optional `strong` lead-in renders in bold ink. */
export type AboutParagraph = { strong?: Bilingual; text: Bilingual };

export const ABOUT = {
  badge: { ka: "ჩვენ შესახებ", en: "About us" },
  title: [
    { ka: "Sidekick შეიქმნა რეალური", en: "Sidekick was created from" },
    { ka: "ბიზნესის საჭიროებიდან", en: "a real business need" },
  ] satisfies Bilingual[],
  photoCaption: { ka: "გუნდის ფოტო", en: "Team photo" },
  paragraphs: [
    {
      text: {
        ka: "ჩვენ არ ვართ კომპანია, რომელმაც უბრალოდ AI ტექნოლოგიის გამოყენება გადაწყვიტა. ჩვენ თვითონ ვმართავთ ბიზნესებს და ყოველდღიურად ვაწყდებოდით იმავე გამოწვევებს, რასაც დღეს ათასობით კომპანია აწყდება — მომხმარებლების დიდი რაოდენობის შეტყობინებები, დაგვიანებული პასუხები, დაკარგული ლიდები, გაყიდვების ხელით მართვა და პროცესები, რომლებიც უამრავ დროსა და რესურსს მოითხოვს.",
        en: "We're not a company that simply decided to adopt AI technology. We run businesses ourselves and faced the same challenges every day that thousands of companies face today — a high volume of customer messages, late replies, lost leads, sales managed by hand, and processes that demand enormous time and resources.",
      },
    },
    {
      text: {
        ka: "ერთ მომენტში მივხვდით, რომ ჩვენი გუნდის მნიშვნელოვანი ნაწილი რუტინულ ამოცანებზე ხარჯავდა დროს. სწორედ ამ პრობლემების გადასაჭრელად დავიწყეთ AI ტექნოლოგიების გამოყენება საკუთარ ბიზნესებში. შედეგებმა მოლოდინს გადააჭარბა — მომხმარებლებმა პასუხების მიღება წამებში დაიწყეს, გაიზარდა კმაყოფილების დონე და გუნდს მეტი დრო დარჩა იმ საკითხებისთვის, რომლებიც ნამდვილად საჭიროებდა ადამიანის ჩართულობას.",
        en: "At some point we realized a significant part of our team was spending time on routine tasks. To solve exactly these problems, we started using AI in our own businesses. The results exceeded expectations — customers began getting answers within seconds, satisfaction rose, and the team had more time for the matters that truly needed a human touch.",
      },
    },
    {
      strong: { ka: "Sidekick AI არ არის უბრალოდ ჩათბოტი.", en: "Sidekick AI is not just a chatbot." },
      text: {
        ka: "ეს არის ბიზნეს ასისტენტი, რომელიც მუშაობს 24 საათის განმავლობაში, პასუხობს მომხმარებლების შეკითხვებს, ეხმარება პროდუქტის შერჩევაში, აგროვებს ლიდებს, აკონტროლებს გაყიდვებს და გაძლევთ სრულ სურათს იმის შესახებ, თუ რა ხდება თქვენს ბიზნესში.",
        en: "It's a business assistant that works around the clock, answers customer questions, helps choose products, collects leads, tracks sales, and gives you the full picture of what's happening in your business.",
      },
    },
    {
      text: {
        ka: "ჩვენ გვჯერა, რომ ტექნოლოგიამ უნდა გაამარტივოს ბიზნესი და არა გაართულოს. ამიტომ Sidekick შექმნილია ისე, რომ მისი გამოყენება ნებისმიერ ბიზნესს შეეძლოს — ტექნიკური ცოდნის გარეშე. ჩვენ უკვე გავიარეთ ეს გზა საკუთარ ბიზნესებში. ახლა მზად ვართ იგივე შესაძლებლობები თქვენს ბიზნესსაც მივცეთ.",
        en: "We believe technology should simplify business, not complicate it. That's why Sidekick is built so any business can use it — with no technical knowledge. We've already walked this path in our own businesses. Now we're ready to give your business the same capabilities.",
      },
    },
  ] satisfies AboutParagraph[],
};

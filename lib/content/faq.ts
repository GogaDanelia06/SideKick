import type { Bilingual } from "./types";

export type FaqItem = { question: Bilingual; answer: Bilingual };

export const FAQ_HEADING = {
  // No badge: it read "ხშირად დასმული" above a title of "FAQ", so the Georgian
  // wording sat in the label and the heading itself was an English acronym —
  // the wrong way round on a Georgian-first site. The full phrase is the title
  // now, which leaves the badge with nothing left to say.
  title: { ka: "ხშირად დასმული კითხვები", en: "Frequently asked questions" },
  sub: {
    ka: "ყველაფერი, რაც უნდა იცოდე Sidekick-ის შესახებ",
    en: "Everything you need to know about Sidekick",
  },
};

export const FAQS: FaqItem[] = [
  {
    question: { ka: "რა არის Sidekick?", en: "What is Sidekick?" },
    answer: {
      ka: "Sidekick არის AI ასისტენტი, რომელიც თქვენს ნაცვლად პასუხობს კლიენტების შეტყობინებებს Facebook-ზე, Instagram-სა და WhatsApp-ზე 24/7 რეჟიმში, აგროვებს ლიდებს და ეხმარება ბიზნესს გაყიდვების ზრდაში — ყოველგვარი კოდის გარეშე.",
      en: "Sidekick is an AI assistant that replies to your customers' messages on Facebook, Instagram and WhatsApp 24/7, captures leads and helps your business grow sales — with no code required.",
    },
  },
  {
    question: { ka: "რომელ არხებზე მუშაობს Sidekick?", en: "Which channels does Sidekick work on?" },
    answer: {
      ka: "Sidekick მუშაობს Facebook Messenger-ზე, Instagram-ის დაირექტში, WhatsApp-სა და თქვენს ვებსაიტზე. ყველა შეტყობინება იყრის თავს ერთ სივრცეში, საიდანაც მართავთ სრულ კომუნიკაციას.",
      en: "Sidekick works on Facebook Messenger, Instagram direct, WhatsApp and your website. Every message comes together in one place, where you manage all your communication.",
    },
  },
  {
    question: {
      ka: "სჭირდება თუ არა პროგრამირების ცოდნა?",
      en: "Do I need coding skills?",
    },
    answer: {
      ka: "არა. Sidekick-ის დაყენება და მართვა შესაძლებელია ტექნიკური ცოდნის გარეშე — ყველაფერს მარტივი ადმინ პანელიდან აკონტროლებთ.",
      en: "No. Setting up and managing Sidekick needs no technical knowledge — you control everything from a simple admin panel.",
    },
  },
  {
    question: {
      ka: "როგორ იცის AI-მ ჩემი პროდუქტების შესახებ?",
      en: "How does the AI know about my products?",
    },
    answer: {
      ka: "AI სწავლობს თქვენს პროდუქტებს, სერვისებსა და ბიზნეს პროცესებს. ის დაკავშირებულია თქვენს პროდუქციის ბაზასთან და მხოლოდ იმ პროდუქტებს სთავაზობს მომხმარებელს, რომლებიც რეალურად მარაგშია.",
      en: "The AI learns your products, services and business processes. It's connected to your product database and only offers customers products that are genuinely in stock.",
    },
  },
  {
    question: { ka: "მართლა უფასოა პირველი თვე?", en: "Is the first month really free?" },
    answer: {
      ka: "დიახ, პირველი თვე ყველა პაკეტზე სრულიად უფასოა. შეგიძლიათ დარწმუნდეთ შედეგში, სანამ გადაიხდით — ფინანსური რისკის გარეშე.",
      en: "Yes, the first month is completely free on every plan. You can see the results before you pay — with no financial risk.",
    },
  },
  {
    question: {
      ka: "შემიძლია თუ არა თავად ჩავერთო საუბარში?",
      en: "Can I take over a conversation myself?",
    },
    answer: {
      ka: "დიახ. მიუხედავად იმისა, რომ AI დამოუკიდებლად პასუხობს, თქვენ ყოველთვის გაქვთ სრული კონტროლი — ნებისმიერ დროს შეგიძლიათ ჩაერთოთ დიალოგში ან საუბარი ოპერატორს გადააბაროთ.",
      en: "Yes. Even though the AI replies on its own, you always keep full control — you can jump into any dialogue at any time or hand it over to a human operator.",
    },
  },
  {
    question: { ka: "რა ღირს Sidekick?", en: "How much does Sidekick cost?" },
    answer: {
      ka: "პაკეტები იწყება თვეში 49 ₾-დან. ხელმისაწვდომია სამი გეგმა — ბეისიქი, სტანდარტი და პრემიუმი — რომლებიც განსხვავდება შეტყობინებების, არხებისა და მომხმარებლების ლიმიტებით.",
      en: "Plans start at 49 ₾ per month. There are three plans — Basic, Standard and Premium — differing in their message, channel and user limits.",
    },
  },
];

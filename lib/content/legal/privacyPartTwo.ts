import type { LegalSection } from "./types";

export const PRIVACY_PART_TWO: LegalSection[] = [
  {
    heading: { ka: "5. რატომ ვამუშავებთ მონაცემებს", en: "5. Why we process data" },
    bullets: [
      { ka: "მომსახურების გაწევა და ანგარიშის ფუნქციონირება — ხელშეკრულების შესრულება;", en: "to provide the Service and operate your account — performance of a contract;" },
      { ka: "გადახდების დამუშავება და ბუღალტრული ვალდებულებები — კანონისმიერი ვალდებულება;", en: "to process payments and meet accounting obligations — legal obligation;" },
      { ka: "პლატფორმის უსაფრთხოება, ბოროტად გამოყენების აღკვეთა — ლეგიტიმური ინტერესი;", en: "platform security and abuse prevention — legitimate interest;" },
      { ka: "მომსახურებასთან დაკავშირებული შეტყობინებების გაგზავნა.", en: "to send Service-related notifications." },
    ],
  },
  {
    heading: { ka: "6. ვის ვუზიარებთ", en: "6. Who we share data with" },
    paragraphs: [
      {
        ka: "მონაცემებს არ ვყიდით. ვუზიარებთ მხოლოდ იმ მომწოდებლებს, რომლებიც აუცილებელია მომსახურების ფუნქციონირებისთვის:",
        en: "We do not sell data. We share it only with providers necessary to run the Service:",
      },
    ],
    bullets: [
      { ka: "ჰოსტინგი და ინფრასტრუქტურა (ვებგვერდის მუშაობა);", en: "hosting and infrastructure providers (to run the website);" },
      { ka: "მონაცემთა ბაზის მომსახურება (მონაცემების შენახვა, სერვერები ევროკავშირში);", en: "database hosting (data storage, servers located in the EU);" },
      { ka: "საგადახდო პროვაიდერი — გადახდების დამუშავებისთვის;", en: "the payment provider — to process payments;" },
      { ka: "სოციალური არხების პროვაიდერები — მხოლოდ იმ შემთხვევაში, თუ თქვენ თავად დააკავშირებთ შესაბამის არხს;", en: "channel providers — only if you choose to connect the relevant channel;" },
      { ka: "სახელმწიფო ორგანოები — კანონით გათვალისწინებულ შემთხვევებში.", en: "public authorities — where required by law." },
    ],
  },
  {
    heading: { ka: "7. შენახვის ვადა", en: "7. Retention" },
    bullets: [
      { ka: "ანგარიშის მონაცემები ინახება ანგარიშის აქტიურობის განმავლობაში;", en: "account data is kept while the account is active;" },
      { ka: "ანგარიშის წაშლის შემდეგ მონაცემები იშლება 【X დღეში】, გარდა კანონით სავალდებულო ჩანაწერებისა (მაგ. საბუღალტრო დოკუმენტაცია);", en: "after deletion, data is removed within 【X days】, except records required by law (e.g. accounting documents);" },
      { ka: "თქვენი კლიენტების მონაცემები იშლება თქვენი მითითებით ან ანგარიშის დახურვისას.", en: "your customers' data is deleted on your instruction or when the account is closed." },
    ],
  },
  {
    heading: { ka: "8. ქუქი-ფაილები", en: "8. Cookies" },
    paragraphs: [
      {
        ka: "ვიყენებთ მხოლოდ ფუნქციურად აუცილებელ ქუქი-ფაილებს — ავტორიზაციის სესიის შესანარჩუნებლად და ინტერფეისის პარამეტრებისთვის (ენა, თემა). სარეკლამო თვალთვალის ქუქიებს არ ვიყენებთ.",
        en: "We use only strictly necessary cookies — to maintain your sign-in session and interface preferences (language, theme). We do not use advertising tracking cookies.",
      },
    ],
  },
  {
    heading: { ka: "9. უსაფრთხოება", en: "9. Security" },
    bullets: [
      { ka: "პაროლები ინახება მხოლოდ ჰეშირებული სახით;", en: "passwords are stored only as hashes;" },
      { ka: "კავშირი დაშიფრულია (HTTPS);", en: "connections are encrypted (HTTPS);" },
      { ka: "თითოეული ბიზნესის მონაცემები სისტემურად გამიჯნულია — ერთი ანგარიში ვერ ხედავს მეორის მონაცემებს;", en: "each business's data is systematically isolated — one account cannot access another's;" },
      { ka: "ანგარიშზე წვდომა შესაძლებელია მხოლოდ ავტორიზაციის შემდეგ, გუნდის წევრებს კი აქვთ როლის შესაბამისი უფლებები.", en: "access requires sign-in, and team members hold role-based permissions." },
    ],
  },
  {
    heading: { ka: "10. კონტაქტი", en: "10. Contact" },
    paragraphs: [
      {
        ka: "კონფიდენციალურობასთან დაკავშირებული საკითხებისთვის: 【privacy@sidekick.ge】",
        en: "For privacy-related matters: 【privacy@sidekick.ge】",
      },
    ],
  },
];

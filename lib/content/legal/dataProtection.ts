import type { LegalDoc } from "./types";

export const DATA_PROTECTION: LegalDoc = {
  slug: "data-protection",
  title: { ka: "პერსონალურ მონაცემთა დაცვა", en: "Personal Data Protection" },
  description: {
    ka: "მონაცემთა სუბიექტის უფლებები, დაცვის ზომები და უფლების განხორციელების წესი Sidekick-ში.",
    en: "Data subject rights, protective measures, and how to exercise your rights at Sidekick.",
  },
  updated: "2026-07-22",
  sections: [
    {
      heading: { ka: "1. სამართლებრივი საფუძველი", en: "1. Legal basis" },
      paragraphs: [
        {
          ka: "პერსონალურ მონაცემებს ვამუშავებთ „პერსონალურ მონაცემთა დაცვის შესახებ“ საქართველოს კანონის შესაბამისად.",
          en: "We process personal data in accordance with the Law of Georgia on Personal Data Protection.",
        },
        {
          ka: "მონაცემები მუშავდება მხოლოდ კონკრეტული, მკაფიოდ განსაზღვრული და ლეგიტიმური მიზნებისთვის, საჭირო მოცულობით.",
          en: "Data is processed only for specific, clearly defined and legitimate purposes, and only to the extent necessary.",
        },
      ],
    },
    {
      heading: { ka: "2. დამუშავების პრინციპები", en: "2. Processing principles" },
      bullets: [
        { ka: "კანონიერება და სამართლიანობა;", en: "lawfulness and fairness;" },
        { ka: "მიზნის შეზღუდვა — მონაცემი არ გამოიყენება შეუთავსებელი მიზნით;", en: "purpose limitation — data is not used for incompatible purposes;" },
        { ka: "მინიმიზაცია — ვაგროვებთ მხოლოდ იმას, რაც აუცილებელია;", en: "minimisation — we collect only what is necessary;" },
        { ka: "სიზუსტე და განახლებადობა;", en: "accuracy and keeping data up to date;" },
        { ka: "შენახვის ვადის შეზღუდვა;", en: "storage limitation;" },
        { ka: "მთლიანობა და კონფიდენციალურობა.", en: "integrity and confidentiality." },
      ],
    },
    {
      heading: { ka: "3. მონაცემთა სუბიექტის უფლებები", en: "3. Data subject rights" },
      paragraphs: [
        { ka: "თქვენ გაქვთ უფლება:", en: "You have the right to:" },
      ],
      bullets: [
        { ka: "მიიღოთ ინფორმაცია, მუშავდება თუ არა თქვენი მონაცემები და რა მიზნით;", en: "be informed whether your data is processed and for what purpose;" },
        { ka: "მოითხოვოთ მონაცემების ასლი;", en: "request a copy of your data;" },
        { ka: "მოითხოვოთ არასწორი მონაცემის შესწორება ან განახლება;", en: "request correction or updating of inaccurate data;" },
        { ka: "მოითხოვოთ მონაცემების წაშლა, თუ არ არსებობს დამუშავების საფუძველი;", en: "request erasure where there is no basis for processing;" },
        { ka: "მოითხოვოთ დამუშავების შეჩერება ან შეზღუდვა;", en: "request suspension or restriction of processing;" },
        { ka: "გამოითხოვოთ თანხმობა, თუ დამუშავება თანხმობას ეფუძნება.", en: "withdraw consent where processing is based on consent." },
      ],
    },
    {
      heading: { ka: "4. როგორ განვახორციელოთ უფლება", en: "4. How to exercise your rights" },
      paragraphs: [
        {
          ka: "მოთხოვნა გამოგვიგზავნეთ ელფოსტაზე 【privacy@sidekick.ge】. პასუხს მოგაწვდით კანონით დადგენილ ვადაში. საჭიროების შემთხვევაში მოგთხოვთ პირადობის დადასტურებას, რათა მონაცემები არასწორ პირს არ გადაეცეს.",
          en: "Send your request to 【privacy@sidekick.ge】. We will respond within the period set by law. Where necessary we may ask you to verify your identity, so that data is not disclosed to the wrong person.",
        },
        {
          ka: "თუ თქვენი მონაცემები პლატფორმაზე განთავსებულია ჩვენი კლიენტი ბიზნესის მიერ, მოთხოვნით პირველ რიგში მიმართეთ შესაბამის ბიზნესს — ამ შემთხვევაში კონტროლიორი ისაა. ჩვენ დავეხმარებით მოთხოვნის შესრულებაში.",
          en: "If your data was placed on the platform by one of our client businesses, address your request to that business first — in that case they are the controller. We will assist them in fulfilling it.",
        },
      ],
    },
    {
      heading: { ka: "5. უსაფრთხოების ზომები", en: "5. Security measures" },
      bullets: [
        { ka: "დაშიფრული კავშირი (HTTPS) ყველა გვერდზე;", en: "encrypted connections (HTTPS) on every page;" },
        { ka: "პაროლების ჰეშირება — ღია ტექსტით არსად ინახება;", en: "password hashing — never stored in plain text;" },
        { ka: "ანგარიშების სისტემური გამიჯვნა — თითოეული ბიზნესი ხედავს მხოლოდ საკუთარ მონაცემებს;", en: "systematic account isolation — each business sees only its own data;" },
        { ka: "როლებზე დაფუძნებული წვდომა გუნდის წევრებისთვის;", en: "role-based access for team members;" },
        { ka: "მონაცემთა ბაზაზე წვდომა შეზღუდულია და აღრიცხვადი.", en: "database access is restricted and auditable." },
      ],
    },
    {
      heading: { ka: "6. საჩივრის უფლება", en: "6. Right to complain" },
      paragraphs: [
        {
          ka: "თუ მიგაჩნიათ, რომ თქვენი მონაცემები დამუშავდა კანონდარღვევით, უფლება გაქვთ მიმართოთ საქართველოს პერსონალურ მონაცემთა დაცვის სამსახურს ან სასამართლოს.",
          en: "If you believe your data has been processed unlawfully, you may contact the Personal Data Protection Service of Georgia or the courts.",
        },
      ],
    },
    {
      heading: { ka: "7. კონტაქტი", en: "7. Contact" },
      paragraphs: [
        {
          ka: "მონაცემთა დაცვის საკითხებზე: 【privacy@sidekick.ge】 · 【+995 XXX XX XX XX】",
          en: "For data protection matters: 【privacy@sidekick.ge】 · 【+995 XXX XX XX XX】",
        },
      ],
    },
  ],
};

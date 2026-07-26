import type { Bilingual } from "./types";

export const LEGAL_REVIEW_NOTICE: Bilingual = {
  ka: "ეს დოკუმენტი მომზადებულია პროექტის ფარგლებში და საჭიროებს იურისტის განხილვას გამოქვეყნებამდე.",
  en: "This document was prepared as part of the project and requires review by a lawyer before publication.",
};

export const LEGAL_ENTITY = {
  name: { ka: 'შპს „საიდქიქ“', en: "Sidekick LLC" } as Bilingual,
  regNumber: "【საიდენტიფიკაციო კოდი】",
  address: "【იურიდიული მისამართი】",
  email: "【legal@sidekick.ge】",
  phone: "【+995 XXX XX XX XX】",
};

export type LegalSection = {
  heading: Bilingual;
  paragraphs?: Bilingual[];
  bullets?: Bilingual[];
};

export type LegalDoc = {
  slug: "terms" | "privacy" | "data-protection";
  title: Bilingual;
  description: Bilingual;
  updated: string;
  sections: LegalSection[];
};

export const TERMS: LegalDoc = {
  slug: "terms",
  title: { ka: "წესები და პირობები", en: "Terms and Conditions" },
  description: {
    ka: "Sidekick-ის მომსახურებით სარგებლობის წესები და პირობები — ანგარიში, პაკეტები, გადახდა, პასუხისმგებლობა.",
    en: "Terms and conditions for using the Sidekick service — accounts, plans, payment and liability.",
  },
  updated: "2026-07-22",
  sections: [
    {
      heading: { ka: "1. ზოგადი დებულებები", en: "1. General provisions" },
      paragraphs: [
        {
          ka: `წინამდებარე წესები და პირობები არეგულირებს 【შპს „საიდქიქ“】-ის (შემდგომში „კომპანია“, „ჩვენ“) მიერ შემოთავაზებული პლატფორმა Sidekick-ით (შემდგომში „მომსახურება“) სარგებლობას.`,
          en: `These terms and conditions govern the use of the Sidekick platform (the "Service") operated by 【Sidekick LLC】 (the "Company", "we").`,
        },
        {
          ka: "ანგარიშის რეგისტრაციით ან მომსახურებით სარგებლობით თქვენ ადასტურებთ, რომ გაეცანით და ეთანხმებით ამ წესებს. თუ არ ეთანხმებით — გთხოვთ, არ ისარგებლოთ მომსახურებით.",
          en: "By registering an account or using the Service you confirm that you have read and accept these terms. If you do not accept them, please do not use the Service.",
        },
      ],
    },
    {
      heading: { ka: "2. მომსახურების აღწერა", en: "2. Description of the Service" },
      paragraphs: [
        {
          ka: "Sidekick არის ვებ-პლატფორმა, რომელიც ბიზნესებს საშუალებას აძლევს ერთ სივრცეში მართონ კლიენტებთან მიმოწერა, ლიდები, პროდუქცია და შეკვეთები.",
          en: "Sidekick is a web platform that lets businesses manage customer conversations, leads, products and orders in one place.",
        },
        {
          ka: "მომსახურების ცალკეული ფუნქციები (მაგალითად, სოციალური არხების ინტეგრაცია ან ავტომატური პასუხების მოდული) შესაძლოა ეტაპობრივად დაემატოს. მათი ხელმისაწვდომობა დამოკიდებულია არჩეულ პაკეტსა და ტექნიკურ მზაობაზე.",
          en: "Individual features (for example channel integrations or the automated reply module) may be introduced in stages. Their availability depends on the selected plan and technical readiness.",
        },
      ],
    },
    {
      heading: { ka: "3. ანგარიში და რეგისტრაცია", en: "3. Account and registration" },
      bullets: [
        {
          ka: "რეგისტრაციისას მომხმარებელი ვალდებულია მიუთითოს უტყუარი და აქტუალური ინფორმაცია.",
          en: "When registering, the user must provide accurate and current information.",
        },
        {
          ka: "მომხმარებელი პასუხისმგებელია საკუთარი პაროლისა და ანგარიშზე წვდომის კონფიდენციალურობაზე.",
          en: "The user is responsible for keeping their password and account access confidential.",
        },
        {
          ka: "ანგარიშზე განხორციელებული ნებისმიერი ქმედება ითვლება მომხმარებლის მიერ განხორციელებულად.",
          en: "Any action taken through an account is deemed to have been taken by the account holder.",
        },
        {
          ka: "ერთი ბიზნეს-ანგარიშის ფარგლებში შესაძლებელია რამდენიმე მომხმარებლის (გუნდის წევრის) დამატება სხვადასხვა უფლებით.",
          en: "Multiple users (team members) with different permission levels may be added to a single business account.",
        },
      ],
    },
    {
      heading: { ka: "4. პაკეტები, ფასი და გადახდა", en: "4. Plans, pricing and payment" },
      bullets: [
        {
          ka: "მომსახურება ხელმისაწვდომია პაკეტების სახით. მოქმედი ფასები მითითებულია ვებგვერდის „ფასების“ გვერდზე.",
          en: "The Service is offered as subscription plans. Current prices are shown on the Pricing page of the website.",
        },
        {
          ka: "საცდელი პერიოდი (პირველი თვე) ხელმისაწვდომია პირობების შესაბამისად და არ საჭიროებს ბარათის დამატებას.",
          en: "A trial period (the first month) is available under the stated conditions and does not require adding a card.",
        },
        {
          ka: "კომპანია იტოვებს უფლებას შეცვალოს ფასები. ცვლილება არ ვრცელდება უკვე გადახდილ პერიოდზე და მომხმარებელი გაფრთხილდება წინასწარ.",
          en: "The Company reserves the right to change prices. Changes do not apply to an already paid period, and users will be notified in advance.",
        },
        {
          ka: "【გადახდის პირობები, დაბრუნების პოლიტიკა და ინვოისირების წესი უნდა დაზუსტდეს საგადახდო პროვაიდერთან ხელშეკრულების შემდეგ.】",
          en: "【Payment terms, refund policy and invoicing rules must be finalised after the agreement with the payment provider.】",
        },
      ],
    },
    {
      heading: { ka: "5. მომხმარებლის ვალდებულებები", en: "5. User obligations" },
      paragraphs: [
        {
          ka: "მომხმარებელი ვალდებულია მომსახურება გამოიყენოს კანონმდებლობის შესაბამისად. კერძოდ, აკრძალულია:",
          en: "The user must use the Service in accordance with applicable law. In particular, it is prohibited to:",
        },
      ],
      bullets: [
        {
          ka: "მესამე პირთა პერსონალური მონაცემების უკანონოდ დამუშავება ან სპამის დაგზავნა;",
          en: "process third parties' personal data unlawfully, or send spam;",
        },
        {
          ka: "პლატფორმის გამოყენება უკანონო, შეცდომაში შემყვანი ან მავნე შინაარსის გასავრცელებლად;",
          en: "use the platform to distribute unlawful, misleading or harmful content;",
        },
        {
          ka: "სისტემის უსაფრთხოების შემოვლის მცდელობა ან სხვისი ანგარიშის მონაცემებზე წვდომა;",
          en: "attempt to bypass system security or access another account's data;",
        },
        {
          ka: "მომსახურების გადაყიდვა ან მესამე პირისთვის გადაცემა კომპანიის თანხმობის გარეშე.",
          en: "resell or transfer the Service to a third party without the Company's consent.",
        },
      ],
    },
    {
      heading: { ka: "6. მომხმარებლის კონტენტი და მონაცემები", en: "6. User content and data" },
      paragraphs: [
        {
          ka: "მომხმარებლის მიერ პლატფორმაზე განთავსებული მონაცემები (პროდუქცია, კლიენტების ჩანაწერები, მიმოწერა) რჩება მომხმარებლის საკუთრებაში. კომპანია მათ ამუშავებს მხოლოდ მომსახურების გაწევის მიზნით.",
          en: "Data the user places on the platform (products, customer records, conversations) remains the user's. The Company processes it solely to provide the Service.",
        },
        {
          ka: "მომხმარებელი პასუხისმგებელია, რომ ჰქონდეს სამართლებრივი საფუძველი თავისი კლიენტების პერსონალური მონაცემების პლატფორმაზე დამუშავებისთვის.",
          en: "The user is responsible for having a lawful basis to process their own customers' personal data on the platform.",
        },
      ],
    },
    {
      heading: { ka: "7. მომსახურების შეჩერება და შეწყვეტა", en: "7. Suspension and termination" },
      bullets: [
        {
          ka: "მომხმარებელს ნებისმიერ დროს შეუძლია შეწყვიტოს მომსახურებით სარგებლობა.",
          en: "The user may stop using the Service at any time.",
        },
        {
          ka: "კომპანიას უფლება აქვს შეაჩეროს ან შეწყვიტოს ანგარიში ამ წესების არსებითი დარღვევის შემთხვევაში, გონივრული გაფრთხილებით.",
          en: "The Company may suspend or terminate an account for a material breach of these terms, with reasonable notice.",
        },
        {
          ka: "ანგარიშის შეწყვეტის შემდეგ მონაცემები ინახება 【X დღე】 და შემდეგ სამუდამოდ იშლება, თუ კანონი სხვას არ ითვალისწინებს.",
          en: "After termination, data is retained for 【X days】 and then permanently deleted, unless the law requires otherwise.",
        },
      ],
    },
    {
      heading: { ka: "8. პასუხისმგებლობის შეზღუდვა", en: "8. Limitation of liability" },
      paragraphs: [
        {
          ka: "მომსახურება მოწოდებულია არსებული სახით. კომპანია იღებს გონივრულ ზომებს უწყვეტი მუშაობისთვის, თუმცა არ იძლევა გარანტიას, რომ მომსახურება იმუშავებს შეფერხების გარეშე.",
          en: "The Service is provided on an “as is” basis. The Company takes reasonable steps to keep it running but does not guarantee uninterrupted operation.",
        },
        {
          ka: "კომპანია არ არის პასუხისმგებელი მესამე მხარის სერვისების (მაგ. სოციალური ქსელების) მუშაობაზე ან მათ მიერ დაწესებულ შეზღუდვებზე.",
          en: "The Company is not responsible for the operation of third-party services (e.g. social networks) or restrictions they impose.",
        },
        {
          ka: "【პასუხისმგებლობის ზღვრული ოდენობა უნდა განისაზღვროს იურისტთან.】",
          en: "【The cap on liability must be determined with a lawyer.】",
        },
      ],
    },
    {
      heading: { ka: "9. ცვლილებები და მოქმედი სამართალი", en: "9. Changes and governing law" },
      paragraphs: [
        {
          ka: "კომპანია უფლებამოსილია შეიტანოს ცვლილებები ამ წესებში. განახლებული ვერსია ქვეყნდება ვებგვერდზე განახლების თარიღის მითითებით.",
          en: "The Company may amend these terms. The updated version is published on the website with its revision date.",
        },
        {
          ka: "წესები რეგულირდება საქართველოს კანონმდებლობით. დავები წყდება მოლაპარაკებით, ხოლო შეთანხმების მიუღწევლობისას — საქართველოს სასამართლოში.",
          en: "These terms are governed by the law of Georgia. Disputes are resolved by negotiation and, failing that, by the courts of Georgia.",
        },
      ],
    },
    {
      heading: { ka: "10. საკონტაქტო ინფორმაცია", en: "10. Contact" },
      paragraphs: [
        {
          ka: "შეკითხვების შემთხვევაში დაგვიკავშირდით: 【legal@sidekick.ge】 · 【+995 XXX XX XX XX】",
          en: "For questions, contact us at: 【legal@sidekick.ge】 · 【+995 XXX XX XX XX】",
        },
      ],
    },
  ],
};

export const PRIVACY: LegalDoc = {
  slug: "privacy",
  title: { ka: "კონფიდენციალურობის პოლიტიკა", en: "Privacy Policy" },
  description: {
    ka: "როგორ ვაგროვებთ, ვიყენებთ და ვიცავთ პერსონალურ მონაცემებს Sidekick-ის გამოყენებისას.",
    en: "How we collect, use and protect personal data when you use Sidekick.",
  },
  updated: "2026-07-22",
  sections: [
    {
      heading: { ka: "1. ვინ ვართ", en: "1. Who we are" },
      paragraphs: [
        {
          ka: "მონაცემთა დამმუშავებელია 【შპს „საიდქიქ“】, საიდენტიფიკაციო კოდი 【—】, მისამართი 【—】.",
          en: "The data controller is 【Sidekick LLC】, registration number 【—】, address 【—】.",
        },
      ],
    },
    {
      heading: {
        ka: "2. ორი განსხვავებული როლი — მნიშვნელოვანია",
        en: "2. Two distinct roles — important",
      },
      paragraphs: [
        {
          ka: "როდესაც თქვენ რეგისტრირდებით და სარგებლობთ პლატფორმით, თქვენს მონაცემებს ვამუშავებთ როგორც დამმუშავებელი (კონტროლიორი).",
          en: "When you register and use the platform, we process your data as the controller.",
        },
        {
          ka: "როდესაც თქვენ პლატფორმაზე ინახავთ თქვენი კლიენტების მონაცემებს (ლიდები, მიმოწერა, შეკვეთები), ამ მონაცემების მიმართ კონტროლიორი ხართ თქვენ, ჩვენ კი მოქმედებთ როგორც უფლებამოსილი პირი (პროცესორი) — მხოლოდ თქვენი მითითებით.",
          en: "When you store your own customers' data on the platform (leads, conversations, orders), you are the controller of that data and we act only as processor, on your instructions.",
        },
      ],
    },
    {
      heading: { ka: "3. რა მონაცემებს ვამუშავებთ", en: "3. What data we process" },
      paragraphs: [
        { ka: "ა) ანგარიშის მონაცემები:", en: "a) Account data:" },
      ],
      bullets: [
        { ka: "სახელი და გვარი, ელფოსტა, ტელეფონის ნომერი;", en: "name, email address, phone number;" },
        {
          ka: "პაროლი — ინახება მხოლოდ დაშიფრული (ჰეშირებული) სახით და არავის, მათ შორის ჩვენთვის, არ არის ხილული;",
          en: "password — stored only in hashed form and visible to no one, including us;",
        },
        {
          ka: "ბიზნესის მონაცემები: დასახელება, საქმიანობის სფერო, საკონტაქტო ინფორმაცია, სამუშაო საათები, მისამართები, ვებგვერდი;",
          en: "business data: name, industry, contact details, working hours, addresses, website;",
        },
        {
          ka: "გამოწერის მონაცემები: არჩეული პაკეტი, გადახდის ისტორია და ბარათის საიდენტიფიკაციო ნიშნული (ბოლო ციფრები). სრულ ბარათის მონაცემებს ჩვენ არ ვინახავთ.",
          en: "subscription data: chosen plan, payment history and a card reference (last digits). We do not store full card details.",
        },
      ],
    },
    {
      heading: {
        ka: "4. თქვენი კლიენტების მონაცემები",
        en: "4. Your customers' data",
      },
      paragraphs: [
        {
          ka: "პლატფორმის გამოყენებისას სისტემაში შესაძლოა მოხვდეს თქვენი კლიენტების შემდეგი მონაცემები:",
          en: "When using the platform, the following data about your customers may be stored:",
        },
      ],
      bullets: [
        { ka: "სახელი, ტელეფონის ნომერი, ელფოსტა და მისამართი (შეკვეთებში);", en: "name, phone number, email and address (in orders);" },
        { ka: "მიმოწერის შინაარსი და გაგზავნის დრო;", en: "the content and timestamps of conversations;" },
        { ka: "ლიდის ჩანაწერი — ინტერესი, წყარო და კომენტარი;", en: "lead records — interest, source and comments;" },
        { ka: "შეკვეთის შემადგენლობა და თანხა.", en: "order contents and totals." },
      ],
    },
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
  ],
};

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

export const LEGAL_DOCS = [TERMS, PRIVACY, DATA_PROTECTION];

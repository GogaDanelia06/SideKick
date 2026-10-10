import type { LegalSection } from "./types";

export const PRIVACY_PART_ONE: LegalSection[] = [
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
];

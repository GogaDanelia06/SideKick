import {
  IconCash,
  IconChartBar,
  IconLayoutGrid,
  IconMessages,
  IconPackage,
  IconShoppingCart,
} from "@tabler/icons-react";
import type { Bilingual, IconType } from "./types";

export type Service = { icon: IconType; title: Bilingual; desc: Bilingual };

export const SERVICES_HEADING = {
  badge: { ka: "სერვისები", en: "Services" },
  title: { ka: "რას მოიცავს Sidekick", en: "What Sidekick includes" },
  sub: { ka: "დააკლიკე ბოქსს დეტალური აღწერისთვის", en: "Click a box for a detailed description" },
};

export const SERVICES: Service[] = [
  {
    icon: IconShoppingCart,
    title: { ka: "პროდუქტების გაყიდვა AI ჩათით", en: "Selling products via AI chat" },
    desc: {
      ka: "მომხმარებლები ხშირად სვამენ ერთსა და იმავე კითხვებს: ფასი, მახასიათებლები, ხელმისაწვდომობა, მიწოდება. Sidekick AI ამ კითხვებს პასუხობს ავტომატურად, 24/7 რეჟიმში, ისე თითქოს თქვენი თანამშრომელი ესაუბრება.\n\nAI სწავლობს თქვენს პროდუქტებს, მომსახურებებსა და ბიზნეს პროცესებს, რის შედეგადაც შეუძლია მომხმარებლების სწორად კონსულტაცია და პროდუქტის შეთავაზება.",
      en: "Customers often ask the same questions: price, features, availability, delivery. Sidekick AI answers them automatically, 24/7, as if a member of your staff were talking to them.\n\nThe AI learns your products, services and business processes, so it can advise customers correctly and recommend the right product.",
    },
  },
  {
    icon: IconChartBar,
    title: { ka: "სტატისტიკა", en: "Analytics" },
    desc: {
      ka: "გაიგეთ ზუსტად როგორ მუშაობს თქვენი AI ასისტენტი და რა გავლენას ახდენს ბიზნესზე. ნახეთ:\n• რამდენ მომხმარებელს უპასუხა AI-მ\n• რამდენი ახალი ლიდი შეიქმნა\n• რამდენი გაყიდვა განხორციელდა\n• ყველაზე ხშირად დასმული კითხვები\n• მომხმარებელთა აქტივობის პიკი საათების მიხედვით",
      en: "Understand exactly how your AI assistant performs and its impact on the business. See:\n• how many customers the AI replied to\n• how many new leads were created\n• how many sales were made\n• the most frequently asked questions\n• peak customer activity by hour",
    },
  },
  {
    icon: IconMessages,
    title: { ka: "მიმოწერების მონიტორინგი", en: "Conversation monitoring" },
    desc: {
      ka: "მიუხედავად იმისა, რომ AI დამოუკიდებლად პასუხობს, თქვენ ყოველთვის გაქვთ სრული კონტროლი. ადმინ პანელიდან შეგიძლიათ:\n• ნახოთ ყველა მიმდინარე და დასრულებული მიმოწერა\n• აკონტროლოთ AI-ის პასუხები\n• ნებისმიერ დროს ჩაერთოთ დიალოგში\n• საუბარი გადააბაროთ ოპერატორს",
      en: "Even though the AI replies on its own, you always keep full control. From the admin panel you can:\n• view every ongoing and finished conversation\n• monitor the AI's replies\n• jump into any dialogue at any time\n• hand a conversation over to a human operator",
    },
  },
  {
    icon: IconCash,
    title: { ka: "გაყიდვების მონიტორინგი", en: "Sales monitoring" },
    desc: {
      ka: "Sidekick გაძლევთ შესაძლებლობას თვალყური ადევნოთ გაყიდვების სრულ პროცესს. ნახეთ:\n• რომელი პროდუქტები იყიდება ყველაზე ხშირად\n• რამდენი შეკვეთა გაფორმდა\n• რა შემოსავალი გენერირდა\n• რომელი არხიდან მოდის ყველაზე მეტი გაყიდვა",
      en: "Sidekick lets you follow the entire sales process. See:\n• which products sell most often\n• how many orders were placed\n• what revenue was generated\n• which channel brings in the most sales",
    },
  },
  {
    icon: IconPackage,
    title: { ka: "საწყობის მონიტორინგი", en: "Inventory monitoring" },
    desc: {
      ka: "მომხმარებლისთვის ყველაზე უსიამოვნო სიტუაციაა პროდუქტის შეკვეთა, რომელიც რეალურად მარაგში აღარ არის.\n\nSidekick დაკავშირებულია თქვენს პროდუქციის ბაზასთან და ყოველთვის ფლობს ინფორმაციას ხელმისაწვდომ მარაგებზე. AI მხოლოდ აქტუალურ პროდუქტებს სთავაზობს მომხმარებელს.",
      en: "The most frustrating experience for a customer is ordering a product that is actually out of stock.\n\nSidekick is connected to your product database and always knows what's in stock. The AI only offers customers products that are genuinely available.",
    },
  },
  {
    icon: IconLayoutGrid,
    title: { ka: "ყველაფერი ერთ სივრცეში", en: "Everything in one place" },
    desc: {
      ka: "დღეს ბიზნესები ხშირად იყენებენ რამდენიმე სისტემას: სოც. ქსელები, CRM, ელფოსტა, შეკვეთები, ანალიტიკა. Sidekick აერთიანებს ამ პროცესებს ერთ სივრცეში:\n• მართოთ AI ასისტენტი\n• აკონტროლოთ მიმოწერები\n• მიიღოთ ლიდები\n• ნახოთ გაყიდვები\n• მართოთ პროდუქტები",
      en: "Today businesses often use several systems: social networks, CRM, email, orders, analytics. Sidekick brings these processes together in one place:\n• manage the AI assistant\n• monitor conversations\n• capture leads\n• view sales\n• manage products",
    },
  },
];

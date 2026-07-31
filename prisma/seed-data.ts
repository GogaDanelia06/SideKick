export const PLANS = [
  { key: "basic", name: "ბეისიქი", nameEn: "Basic", price: 49, msgLimit: 1000, channelCap: 1, userCap: 1, productCap: 100, featured: false },
  { key: "standard", name: "სტანდარტი", nameEn: "Standard", price: 99, msgLimit: 10000, channelCap: 3, userCap: 5, productCap: 1000, featured: true },
  { key: "premium", name: "პრემიუმი", nameEn: "Premium", price: 199, msgLimit: -1, channelCap: -1, userCap: -1, productCap: -1, featured: false },
];

export const SITE_STATS = [
  { key: "total_users", labelKa: "მომხმარებელი ჯამში", labelEn: "Users in total", value: "1,200+", order: 0 },
  { key: "active_chats_today", labelKa: "აქტიური ჩატი დღეს", labelEn: "Active chats today", value: "8,540", order: 1 },
  { key: "revenue", labelKa: "გაყიდული პროდუქცია ბოტებით", labelEn: "Products sold via bots", value: "2.4M₾", order: 2 },
];

export const PRODUCTS = [
  { name: "თეთრი კაბა", code: "DR-014", price: 189, discountPct: 16, salePrice: 159, size: "S/M/L", quantity: 24 },
  { name: "iPhone 15 Pro", code: "PH-201", price: 3500, quantity: 6 },
  { name: "სპორტული ფეხსაცმელი", code: "SH-088", price: 249, discountPct: 20, salePrice: 199, size: "40-45", quantity: 0 },
  { name: "AirPods Pro", code: "AP-045", price: 649, quantity: 13 },
  { name: "ტყავის ჩანთა", code: "BG-112", price: 420, discountPct: 10, salePrice: 380, quantity: 3 },
];

export const CHANNELS = [
  { type: "FACEBOOK", status: "ACTIVE", connected: true },
  { type: "INSTAGRAM", status: "ACTIVE", connected: true },
  { type: "WHATSAPP", status: "DELAYED", connected: true },
  { type: "WEBSITE", status: "OFF", connected: false },
] as const;

export const LEADS = [
  { name: "ნინო კ.", phone: "+995 599 12 34 56", interest: "თეთრი კაბა M", source: "Instagram", status: "NEW", comment: "ფასი დააკმაყოფილა" },
  { name: "გიორგი მ.", phone: "+995 577 88 77 66", interest: "iPhone 15 Pro", source: "WhatsApp", status: "ACTIVE", comment: "ელოდება მარაგს" },
  { name: "ლევან თ.", phone: "+995 555 33 22 11", interest: "სპორტული ფეხსაცმელი", source: "Facebook", status: "CLOSED", comment: "გაიყიდა" },
  { name: "თამარ ლ.", phone: "+995 598 44 55 66", interest: "საათი", source: "Website", status: "NEW", comment: "" },
] as const;

export const ORDERS = [
  { customerName: "ნინო კ.", phone: "+995 599 12 34 56", address: "თბილისი, ვაჟა-ფშაველა 12", status: "NEW", items: [{ code: "DR-014", name: "თეთრი კაბა", qty: 1, price: 159 }] },
  { customerName: "გიორგი მ.", phone: "+995 577 88 77 66", address: "ბათუმი, ჭავჭავაძის 45", status: "NEW", items: [{ code: "BG-112", name: "ტყავის ჩანთა", qty: 1, price: 380 }] },
  { customerName: "ბექა დ.", phone: "+995 555 33 22 11", address: "ქუთაისი, თამარ მეფის 8", status: "TO_SEND", items: [{ code: "AP-045", name: "AirPods Pro", qty: 1, price: 649 }] },
  { customerName: "ანა ს.", phone: "+995 598 44 55 66", address: "თბილისი, პეკინის 3", status: "DONE", items: [{ code: "DR-014", name: "თეთრი კაბა", qty: 2, price: 159 }] },
] as const;

export const FAQS = [
  { question: "რამდენ ხანში ხდება მიწოდება?", answer: "თბილისში 1-2 დღე, რეგიონებში 2-4 დღე." },
  { question: "შესაძლებელია დაბრუნება?", answer: "დიახ, 14 დღის განმავლობაში, თუ პროდუქტი გამოუყენებელია." },
];

export const AI_CONFIG = {
  languages: ["ქართული"],
  style: "პროფესიონალური",
  length: "საშუალო",
  emoji: "ზომიერად",
  addressForm: "ფორმალური",
  roles: ["info", "sales", "leads", "orders", "support"],
  prompt: "შენ ხარ Sidekick-ის AI ასისტენტი. უპასუხე თავაზიანად, დაეხმარე პროდუქტის შერჩევაში და შეკვეთის გაფორმებაში.",
};

export const TEAM_MEMBERS = [
  { name: "Luka G.", email: "luka@sidekick.ge", role: "ADMIN" },
  { name: "Nino B.", email: "nino@sidekick.ge", role: "OPERATOR" },
  { name: "Data T.", email: "data@sidekick.ge", role: "VIEWER" },
] as const;

export const PAYMENTS = [
  { description: "Standard პაკეტი — ივლისი", amount: 99, date: "2026-07-01" },
  { description: "Standard პაკეტი — ივნისი", amount: 99, date: "2026-06-01" },
  { description: "Standard პაკეტი — მაისი", amount: 99, date: "2026-05-01" },
  { description: "Basic → Standard განახლება", amount: 50, date: "2026-04-18" },
];

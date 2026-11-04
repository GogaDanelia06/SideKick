import type { LegalDoc } from "./types";

export const DATA_DELETION: LegalDoc = {
  slug: "data-deletion",
  title: { ka: "მონაცემების წაშლა", en: "Data Deletion Instructions" },
  description: {
    ka: "როგორ გათიშოთ Facebook და Instagram და როგორ მოითხოვოთ თქვენი მონაცემების წაშლა Sidekick-იდან.",
    en: "How to disconnect Facebook and Instagram and ask Sidekick to delete your data.",
  },
  updated: "2026-11-04",
  sections: [
    {
      heading: { ka: "1. რას ვიღებთ Facebook-იდან და Instagram-იდან", en: "1. What we receive from Facebook and Instagram" },
      paragraphs: [
        {
          ka: "როცა Sidekick-ს Facebook გვერდს ან Instagram-ის პროფესიულ ანგარიშს აკავშირებთ, ვინახავთ ანგარიშის ID-ს, სახელს, წვდომის ტოკენს და შეტყობინებებს, რომლებსაც კლიენტები ამ ანგარიშს სწერენ, რათა AI ასისტენტმა და თქვენმა გუნდმა უპასუხონ.",
          en: "When you connect a Facebook Page or an Instagram professional account to Sidekick, we store the account's ID, its name, an access token and the messages customers send to that account, so the AI assistant and your team can answer them.",
        },
      ],
    },
    {
      heading: { ka: "2. Facebook-ის ან Instagram-ის გათიშვა", en: "2. Disconnect Facebook or Instagram" },
      bullets: [
        {
          ka: "Sidekick-ში: დაშბორდი → არხები → დაკავშირებული არხი → „გათიშვა“. წვდომის ტოკენი მაშინვე იშლება და ამ ანგარიშიდან ახალ შეტყობინებებს აღარ ვიღებთ.",
          en: "In Sidekick: Dashboard → Channels → the connected channel → “Disconnect”. The access token is deleted at once and we stop receiving new messages from that account.",
        },
        {
          ka: "Facebook-ზე: პარამეტრები და კონფიდენციალურობა → პარამეტრები → ბიზნეს ინტეგრაციები → Sidekick → წაშლა.",
          en: "On Facebook: Settings & privacy → Settings → Business integrations → Sidekick → Remove.",
        },
        {
          ka: "Instagram-ზე: პარამეტრები → ვებსაიტის ნებართვები → აპები და ვებსაიტები → Sidekick → წაშლა.",
          en: "On Instagram: Settings → Website permissions → Apps and websites → Sidekick → Remove.",
        },
      ],
    },
    {
      heading: { ka: "3. მონაცემების წაშლის მოთხოვნა", en: "3. Ask us to delete your data" },
      paragraphs: [
        {
          ka: "Sidekick-ის ანგარიშისა და Facebook-იდან და Instagram-იდან მიღებული ყველა მონაცემის (ანგარიშის დეტალები, ტოკენები, საუბრები და შეტყობინებები) წასაშლელად მოგვწერეთ info@sidekick.ge-ზე იმ ელფოსტიდან, რომლითაც Sidekick-ში ხართ დარეგისტრირებული. სათაურში მიუთითეთ „მონაცემების წაშლა“, ტექსტში კი თქვენი ბიზნესის სახელი.",
          en: "To delete your Sidekick account and everything we received from Facebook and Instagram (account details, tokens, conversations and messages), email info@sidekick.ge from the address you use for Sidekick. Put “Data deletion request” in the subject and the name of your business in the message.",
        },
      ],
    },
    {
      heading: { ka: "4. რა ხდება შემდეგ", en: "4. What happens next" },
      bullets: [
        {
          ka: "მოთხოვნას 30 დღის განმავლობაში ვასრულებთ და დასრულებისას ელფოსტით გატყობინებთ.",
          en: "We complete the request within 30 days and email you when it is done.",
        },
        {
          ka: "სარეზერვო ასლებიდან მონაცემები ჩვეულებრივი განახლების ციკლში იშლება.",
          en: "Copies in backups are removed as the backups are replaced.",
        },
        {
          ka: "ვინახავთ მხოლოდ იმას, რისი შენახვაც კანონით გვევალება (მაგ. გადახდის ჩანაწერები), და მხოლოდ საჭირო ვადით.",
          en: "We keep only what the law requires us to keep, such as payment records, and only for as long as required.",
        },
      ],
    },
    {
      heading: { ka: "5. თუ Sidekick-ის მომხმარებელ ბიზნესს მისწერეთ", en: "5. If you messaged a business that uses Sidekick" },
      paragraphs: [
        {
          ka: "ამ საუბრებს ის ბიზნესი მართავს. სთხოვეთ მას წაშლა, ან მოგვწერეთ info@sidekick.ge-ზე თქვენი სახელით და ბიზნესის გვერდის მითითებით, და საუბარს წავშლით.",
          en: "Those conversations belong to that business. Ask the business to delete them, or email info@sidekick.ge with your name and the business's Page, and we will delete the conversation.",
        },
      ],
    },
  ],
};

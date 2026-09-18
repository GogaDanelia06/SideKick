import type { Bilingual } from "@/lib/content/types";
import type { SaveError } from "@/lib/dashboard/autosave/request";

export const SAVED: Bilingual = { ka: "შენახულია", en: "Saved" };

export const SAVE_ERROR: Bilingual = { ka: "ვერ შეინახა — სცადე ხელახლა", en: "Couldn't save — try again" };

export const FORBIDDEN: Bilingual = {
  ka: "ამის შეცვლის უფლება არ გაქვს",
  en: "You don't have permission to change this",
};

export const AUTOSAVE_HINT: Bilingual = {
  ka: "ცვლილებები ავტომატურად შეინახება, როცა ამ განყოფილებას დატოვებ",
  en: "Changes are saved automatically when you leave this section",
};

export const RESTORED: Bilingual = {
  ka: "აღდგა შეუნახავი ცვლილებები. შეინახება, როცა ამ განყოფილებას დატოვებ.",
  en: "Unsaved changes were restored. They will be saved when you leave this section.",
};

const NOT_SAVED: Bilingual = {
  ka: "ვერ შეინახა. ცვლილებები ამ ბრაუზერში დარჩა და შეინახება შემდეგ ჯერზე.",
  en: "Couldn't save. Your changes stay in this browser and will be saved next time.",
};

/** Why an autosave did not go through; the changes are kept wherever that helps. */
export const SAVE_OUTCOME: Record<SaveError, Bilingual> = {
  forbidden: FORBIDDEN,
  signed_out: {
    ka: "სესია დასრულდა. ცვლილებები ამ ბრაუზერში დარჩა და შეინახება, როცა ხელახლა შეხვალ.",
    en: "Your session ended. Your changes stay in this browser and will be saved after you log in again.",
  },
  moved: {
    ka: "სხვა ბიზნესზე გადაერთე. ცვლილებები შეინახება, როცა ამ ბიზნესს დაუბრუნდები.",
    en: "You switched to another business. The changes will be saved when you come back to this one.",
  },
  invalid: NOT_SAVED,
  failed: NOT_SAVED,
};

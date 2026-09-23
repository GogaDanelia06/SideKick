import type { Bilingual } from "@/lib/content/types";
import type { SaveError } from "@/lib/dashboard/sectionSave/request";

export const SAVE: Bilingual = { ka: "შენახვა", en: "Save" };
export const CANCEL: Bilingual = { ka: "გაუქმება", en: "Cancel" };
export const SAVING: Bilingual = { ka: "ინახება…", en: "Saving…" };
export const SAVED: Bilingual = { ka: "შენახულია", en: "Saved" };

/** For a save with nothing more to say about it than that it did not happen. */
export const SAVE_ERROR: Bilingual = { ka: "ვერ შეინახა — სცადე ხელახლა", en: "Couldn't save — try again" };

export const UNSAVED: Bilingual = { ka: "შეუნახავი ცვლილებები", en: "Unsaved changes" };
export const ALL_SAVED: Bilingual = { ka: "ყველაფერი შენახულია", en: "Everything is saved" };

export const FORBIDDEN: Bilingual = {
  ka: "ამის შეცვლის უფლება არ გაქვს",
  en: "You don't have permission to change this",
};

/** Shown when the section opens with changes from last time that never reached the server. */
export const RESTORED: Bilingual = {
  ka: "აღდგა შეუნახავი ცვლილებები. დააჭირე „შენახვას“, რომ დარჩეს.",
  en: "Your unsaved changes were restored. Press Save to keep them.",
};

const NOT_SAVED: Bilingual = {
  ka: "ვერ შეინახა. ცვლილებები ამ ბრაუზერში დარჩა — სცადე ხელახლა.",
  en: "Couldn't save. Your changes stay in this browser — try again.",
};

/** Why a save did not go through; the changes are kept wherever that helps. */
export const SAVE_OUTCOME: Record<SaveError, Bilingual> = {
  forbidden: FORBIDDEN,
  signed_out: {
    ka: "სესია დასრულდა. ცვლილებები ამ ბრაუზერში დარჩა — შედი და შეინახე ხელახლა.",
    en: "Your session ended. Your changes stay in this browser — log in and save again.",
  },
  moved: {
    ka: "სხვა ბიზნესზე გადაერთე. ცვლილებები შეინახება, როცა ამ ბიზნესს დაუბრუნდები.",
    en: "You switched to another business. The changes are waiting for you back in this one.",
  },
  invalid: NOT_SAVED,
  failed: NOT_SAVED,
};

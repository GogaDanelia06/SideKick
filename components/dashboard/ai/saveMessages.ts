import type { SaveError } from "@/lib/dashboard/sectionSave/request";
import type { Text } from "@/lib/i18n/messages";

export const SAVE: Text = "dashboard.ai.saveMessages.save";
export const CANCEL: Text = "dashboard.ai.saveMessages.cancel";
export const SAVING: Text = "dashboard.ai.saveMessages.saving";
export const SAVED: Text = "dashboard.ai.saveMessages.saved";

/** For a save with nothing more to say about it than that it did not happen. */
export const SAVE_ERROR: Text = "dashboard.ai.saveMessages.couldnTSaveTry";

export const UNSAVED: Text = "dashboard.ai.saveMessages.unsavedChanges";
export const ALL_SAVED: Text = "dashboard.ai.saveMessages.everythingIsSaved";

export const FORBIDDEN: Text = "dashboard.ai.saveMessages.youDonTHave";

/** Shown when the section opens with changes from last time that never reached the server. */
export const RESTORED: Text = "dashboard.ai.saveMessages.yourUnsavedChangesWere";

const NOT_SAVED: Text = "dashboard.ai.saveMessages.couldnTSaveYour";

/** Why a save did not go through; the changes are kept wherever that helps. */
export const SAVE_OUTCOME: Record<SaveError, Text> = {
  forbidden: FORBIDDEN,
  signed_out: "dashboard.ai.saveMessages.yourSessionEndedYour",
  moved: "dashboard.ai.saveMessages.youSwitchedToAnother",
  invalid: NOT_SAVED,
  failed: NOT_SAVED,
};

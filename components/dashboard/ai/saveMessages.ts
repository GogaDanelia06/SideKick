import type { SaveError } from "@/lib/dashboard/sectionSave/request";
import type { Text } from "@/lib/i18n/messages";

export const SAVE: Text = "dashboard.ai.saveMessages.save";
export const CANCEL: Text = "dashboard.ai.saveMessages.cancel";
export const SAVING: Text = "dashboard.ai.saveMessages.saving";
export const SAVED: Text = "dashboard.ai.saveMessages.saved";

export const SAVE_ERROR: Text = "dashboard.ai.saveMessages.couldnTSaveTry";

export const UNSAVED: Text = "dashboard.ai.saveMessages.unsavedChanges";
export const ALL_SAVED: Text = "dashboard.ai.saveMessages.everythingIsSaved";

export const FORBIDDEN: Text = "dashboard.ai.saveMessages.youDonTHave";

export const RESTORED: Text = "dashboard.ai.saveMessages.yourUnsavedChangesWere";

const NOT_SAVED: Text = "dashboard.ai.saveMessages.couldnTSaveYour";

export const SAVE_OUTCOME: Record<SaveError, Text> = {
  forbidden: FORBIDDEN,
  signed_out: "dashboard.ai.saveMessages.yourSessionEndedYour",
  moved: "dashboard.ai.saveMessages.youSwitchedToAnother",
  invalid: NOT_SAVED,
  failed: NOT_SAVED,
};

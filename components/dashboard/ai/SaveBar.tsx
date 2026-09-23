"use client";

import clsx from "clsx";
import { IconCheck, IconDeviceFloppy, IconLoader2, IconPencilExclamation } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { ALL_SAVED, CANCEL, SAVE, SAVING, UNSAVED } from "./saveMessages";

/** A section's Save and Cancel, with a word on where the section stands. */
export function SaveBar({
  dirty,
  saving,
  onCancel,
}: {
  dirty: boolean;
  saving: boolean;
  onCancel: () => void;
}) {
  const { t } = useLanguage();
  const state = saving ? "saving" : dirty ? "dirty" : "saved";
  const StateIcon = { saving: IconLoader2, dirty: IconPencilExclamation, saved: IconCheck }[state];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border2 pt-4">
      <p
        role="status"
        className={clsx("flex items-center gap-1.5 text-xs", state === "dirty" ? "text-amber" : "text-muted")}
      >
        <StateIcon size={15} className={clsx("shrink-0", state === "saving" && "animate-spin")} />
        {t({ saving: SAVING, dirty: UNSAVED, saved: ALL_SAVED }[state])}
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={!dirty || saving}
          className="h-9 rounded-[8px] px-3.5 text-[13px] text-muted hover:bg-soft disabled:pointer-events-none disabled:opacity-50"
        >
          {t(CANCEL)}
        </button>
        <button
          type="submit"
          disabled={!dirty || saving}
          className="inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-primary px-4 text-[13px] font-medium text-white hover:bg-primary-hover disabled:pointer-events-none disabled:opacity-50"
        >
          <IconDeviceFloppy size={15} />
          {t(SAVE)}
        </button>
      </div>
    </div>
  );
}

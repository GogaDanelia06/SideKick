"use client";

import type { ProfileError } from "@/lib/dashboard/actions/profile";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";

export const PROFILE_SAVED: Text = "dashboard.profile.fields.profileSaved";

export const PROFILE_ERRORS: Record<ProfileError, Text> = {
  signed_out: "dashboard.profile.fields.yourSessionEndedLog",
  name: "dashboard.profile.fields.enterTheCompanyName",
  taken: "dashboard.profile.fields.youAlreadyHaveA",
  failed: "dashboard.profile.fields.couldnTSaveTry",
};

const BOX = "w-full rounded-[8px] border border-input bg-canvas text-sm outline-none focus:border-blue disabled:opacity-60";

/** One field of the profile form: a line, or a box of `rows` lines. */
export function ProfileField({
  name,
  label,
  defaultValue,
  disabled,
  rows,
}: {
  name: string;
  label: Text;
  defaultValue: string;
  disabled?: boolean;
  rows?: number;
}) {
  const { t } = useLanguage();
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-xs text-muted">{t(label)}</span>
      {rows ? (
        <textarea name={name} defaultValue={defaultValue} rows={rows} className={`${BOX} p-3`} />
      ) : (
        <input name={name} defaultValue={defaultValue} disabled={disabled} className={`${BOX} h-10 px-3`} />
      )}
    </label>
  );
}

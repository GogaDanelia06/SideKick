"use client";

import type { Bilingual } from "@/lib/content/types";
import type { ProfileError } from "@/lib/dashboard/actions/profile";
import { useLanguage } from "@/lib/i18n/useLanguage";

export const PROFILE_SAVED: Bilingual = { ka: "პროფილი შენახულია", en: "Profile saved" };

export const PROFILE_ERRORS: Record<ProfileError, Bilingual> = {
  signed_out: { ka: "სესია დასრულდა. შედი და სცადე ხელახლა.", en: "Your session ended. Log in and try again." },
  name: { ka: "ჩაწერე კომპანიის სახელი", en: "Enter the company name" },
  taken: { ka: "ამ სახელით ბიზნესი უკვე გაქვს", en: "You already have a business with this name" },
  failed: { ka: "ვერ შეინახა — სცადე ხელახლა", en: "Couldn't save — try again" },
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
  label: Bilingual;
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

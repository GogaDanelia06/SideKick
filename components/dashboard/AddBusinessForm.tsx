"use client";

import { useState, type FormEvent } from "react";
import { addBusiness, type AddBusinessError, type AddBusinessResult } from "@/lib/dashboard/actions/businesses";
import { flushAutosave } from "@/lib/dashboard/autosave/flush";
import { BUSINESS_NAME_MAX, OWNED_LIMIT_TEXT, sameBusinessName } from "@/lib/dashboard/businesses";
import type { Bilingual } from "@/lib/i18n/types";
import { useLanguage } from "@/lib/i18n/useLanguage";

const ERRORS: Record<AddBusinessError, Bilingual> = {
  unauthorized: { ka: "სესია ამოიწურა. შედი და სცადე თავიდან.", en: "Your session has ended. Log in and try again." },
  name: { ka: "ჩაწერე ბიზნესის სახელი", en: "Enter the business name" },
  taken: { ka: "ამ სახელით ბიზნესი უკვე გაქვს", en: "You already have a business with this name" },
  limit: OWNED_LIMIT_TEXT,
  failed: { ka: "ვერ დაემატა. სცადე ხელახლა.", en: "Could not add it. Try again." },
};

/** Names a new business; it gets the same defaults as at registration and opens straight away. */
/** `taken`: the names already in the switcher, so a repeat is caught while typing. */
type Props = { taken: string[]; onCancel: () => void; onSettled: (message: string) => void };

export function AddBusinessForm({ taken, onCancel, onSettled }: Props) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AddBusinessError | null>(null);
  const repeated = taken.some((existing) => sameBusinessName(existing, name));
  const shown: AddBusinessError | null = repeated ? "taken" : error;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || repeated) return;
    setBusy(true);
    setError(null);
    // The new business opens next; unsaved AI settings belong to this one.
    await flushAutosave();
    const result = await addBusiness(name).catch((): AddBusinessResult => ({ ok: false, error: "failed" }));
    if (result.ok) {
      const added = name.trim();
      onSettled(t({ ka: `„${added}“ დაემატა და გაიხსნა`, en: `Added and opened "${added}"` }));
      return;
    }
    setError(result.error);
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="px-2.5 pb-2 pt-1">
      <label className="block text-[12px] text-muted">
        {t({ ka: "ბიზნესის სახელი", en: "Business name" })}
        <input
          autoFocus
          value={name}
          maxLength={BUSINESS_NAME_MAX}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={shown === "name" || shown === "taken" || undefined}
          className="mt-1 h-9 w-full rounded-[8px] border border-input bg-canvas px-3 text-[13px] text-ink outline-none focus:border-blue"
        />
      </label>
      {shown ? (
        <p role="alert" className="mt-1.5 text-[12px] text-red">
          {t(ERRORS[shown])}
        </p>
      ) : null}
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="h-8 rounded-[8px] px-3 text-[13px] text-muted hover:bg-soft">
          {t({ ka: "გაუქმება", en: "Cancel" })}
        </button>
        <button
          type="submit"
          disabled={busy || !name.trim() || repeated}
          className="h-8 rounded-[8px] bg-primary px-3.5 text-[13px] font-medium text-white disabled:opacity-60"
        >
          {t({ ka: "დამატება", en: "Add" })}
        </button>
      </div>
    </form>
  );
}

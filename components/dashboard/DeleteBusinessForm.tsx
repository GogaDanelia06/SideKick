"use client";

import { useState, type FormEvent } from "react";
import { deleteBusiness, type DeleteBusinessError, type DeleteBusinessResult } from "@/lib/dashboard/actions/deleteBusiness";
import { flushAutosave } from "@/lib/dashboard/autosave/flush";
import type { Bilingual } from "@/lib/i18n/types";
import { useLanguage } from "@/lib/i18n/useLanguage";

const ERRORS: Record<DeleteBusinessError, Bilingual> = {
  unauthorized: { ka: "სესია ამოიწურა. შედი და სცადე თავიდან.", en: "Your session has ended. Log in and try again." },
  forbidden: { ka: "ბიზნესის წაშლა მხოლოდ მის მფლობელს შეუძლია", en: "Only the owner can delete a business" },
  confirm: { ka: "სახელი არ ემთხვევა", en: "The name doesn't match" },
  last: { ka: "ერთადერთ ბიზნესს ვერ წაშლი", en: "You can't delete your only business" },
  members: {
    ka: "ჯერ გუნდის სხვა წევრები წაშალე, „გუნდი“ გვერდზე",
    en: "Remove the other team members first, on the Team page",
  },
  paid: {
    ka: "ამ ბიზნესს გადახდები აქვს, ამიტომ აქედან ვერ წაიშლება. მოგვწერე და დაგეხმარებით.",
    en: "This business has payments on record, so it can't be deleted here. Write to us and we'll help.",
  },
  failed: { ka: "ვერ წაიშალა. სცადე ხელახლა.", en: "Couldn't delete it. Try again." },
};

type Props = { business: { id: string; name: string }; onCancel: () => void; onSettled: (message: string) => void };

/** Deleting cannot be undone, so the owner types the business name first, as on GitHub. */
export function DeleteBusinessForm({ business, onCancel, onSettled }: Props) {
  const { t } = useLanguage();
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<DeleteBusinessError | null>(null);
  const matches = typed.trim() === business.name.trim();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !matches) return;
    setBusy(true);
    setError(null);
    await flushAutosave();
    const result = await deleteBusiness(business.id, typed).catch((): DeleteBusinessResult => ({ ok: false, error: "failed" }));
    if (result.ok) {
      onSettled(t({ ka: `„${business.name}“ წაიშალა`, en: `Deleted "${business.name}"` }));
      return;
    }
    setError(result.error);
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="mx-1 my-1 rounded-[8px] border border-red bg-red-surface p-2.5">
      <p className="text-[12px] leading-snug text-ink">
        {t({
          ka: `„${business.name}“ სამუდამოდ წაიშლება, მისი პროდუქტებით, შეკვეთებით, მიმოწერებით და AI-ის პარამეტრებით. ამის დაბრუნება შეუძლებელია.`,
          en: `"${business.name}" will be deleted for good, with its products, orders, chats and AI settings. This can't be undone.`,
        })}
      </p>
      <label className="mt-2 block text-[12px] text-muted">
        {t({ ka: "დასადასტურებლად ჩაწერე ბიზნესის სახელი", en: "Type the business name to confirm" })}
        <input
          autoFocus
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={business.name}
          aria-invalid={error === "confirm" || undefined}
          className="mt-1 h-9 w-full rounded-[8px] border border-input bg-canvas px-3 text-[13px] text-ink outline-none placeholder:text-faint focus:border-red"
        />
      </label>
      {error ? (
        <p role="alert" className="mt-1.5 text-[12px] text-red">
          {t(ERRORS[error])}
        </p>
      ) : null}
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="h-8 rounded-[8px] px-3 text-[13px] text-muted hover:bg-soft">
          {t({ ka: "გაუქმება", en: "Cancel" })}
        </button>
        <button
          type="submit"
          disabled={busy || !matches}
          className="h-8 rounded-[8px] bg-red px-3.5 text-[13px] font-medium text-white disabled:opacity-50"
        >
          {t({ ka: "წაშლა", en: "Delete" })}
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { deleteBusiness, type DeleteBusinessError, type DeleteBusinessResult } from "@/lib/dashboard/actions/deleteBusiness";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";

const ERRORS: Record<DeleteBusinessError, Text> = {
  unauthorized: "dashboard.deleteBusinessForm.yourSessionHasEnded",
  forbidden: "dashboard.deleteBusinessForm.onlyTheOwnerCan",
  confirm: "dashboard.deleteBusinessForm.theNameDoesnT",
  last: "dashboard.deleteBusinessForm.youCanTDelete",
  members: "dashboard.deleteBusinessForm.removeTheOtherTeam",
  paid: "dashboard.deleteBusinessForm.thisBusinessHasPayments",
  failed: "dashboard.deleteBusinessForm.couldnTDeleteIt",
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
    const result = await deleteBusiness(business.id, typed).catch((): DeleteBusinessResult => ({ ok: false, error: "failed" }));
    if (result.ok) {
      onSettled(t("dashboard.deleteBusinessForm.deleted", { name: business.name }));
      return;
    }
    setError(result.error);
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="mx-1 my-1 rounded-[8px] border border-red bg-red-surface p-2.5">
      <p className="text-[12px] leading-snug text-ink">
        {t("dashboard.deleteBusinessForm.warning", { name: business.name })}
      </p>
      <label className="mt-2 block text-[12px] text-muted">
        {t("dashboard.deleteBusinessForm.typeTheBusinessName")}
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
          {t("dashboard.deleteBusinessForm.cancel")}
        </button>
        <button
          type="submit"
          disabled={busy || !matches}
          className="h-8 rounded-[8px] bg-red px-3.5 text-[13px] font-medium text-white disabled:opacity-50"
        >
          {t("dashboard.deleteBusinessForm.delete")}
        </button>
      </div>
    </form>
  );
}

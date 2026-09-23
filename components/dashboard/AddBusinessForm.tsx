"use client";

import { useState, type FormEvent } from "react";
import { addBusiness, type AddBusinessError, type AddBusinessResult } from "@/lib/dashboard/actions/businesses";
import { BUSINESS_NAME_MAX, OWNED_LIMIT_TEXT, sameBusinessName } from "@/lib/dashboard/businesses";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";

const ERRORS: Record<AddBusinessError, Text> = {
  unauthorized: "dashboard.addBusinessForm.yourSessionHasEnded",
  name: "dashboard.addBusinessForm.enterTheBusinessName",
  taken: "dashboard.addBusinessForm.youAlreadyHaveA",
  limit: OWNED_LIMIT_TEXT,
  failed: "dashboard.addBusinessForm.couldNotAddIt",
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
    const result = await addBusiness(name).catch((): AddBusinessResult => ({ ok: false, error: "failed" }));
    if (result.ok) {
      const added = name.trim();
      onSettled(t("dashboard.addBusinessForm.addedAndOpened", { name: added }));
      return;
    }
    setError(result.error);
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="px-2.5 pb-2 pt-1">
      <label className="block text-[12px] text-muted">
        {t("dashboard.addBusinessForm.businessName")}
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
          {t("dashboard.addBusinessForm.cancel")}
        </button>
        <button
          type="submit"
          disabled={busy || !name.trim() || repeated}
          className="h-8 rounded-[8px] bg-primary px-3.5 text-[13px] font-medium text-white disabled:opacity-60"
        >
          {t("dashboard.addBusinessForm.add")}
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { IconCheck, IconLoader2, IconPlus } from "@tabler/icons-react";
import { switchBusiness } from "@/lib/dashboard/actions/businesses";
import { flushAutosave } from "@/lib/dashboard/autosave/flush";
import { MAX_OWNED_BUSINESSES, OWNED_LIMIT_TEXT, ROLE_LABEL } from "@/lib/dashboard/businesses";
import type { Account } from "@/lib/dashboard/queries/account";
import { DASH } from "@/lib/dashboard/routes";
import { initialOf } from "@/lib/i18n/initial";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { AddBusinessForm } from "./AddBusinessForm";

/** Every business the user belongs to, one click apart, like switching accounts in Gmail. */
export function BusinessSwitcher({ account }: { account: Account }) {
  const { t } = useLanguage();
  const [opening, setOpening] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [adding, setAdding] = useState(false);
  const owned = account.businesses.filter((b) => b.role === "OWNER").length;

  async function open(businessId: string) {
    if (opening || businessId === account.businessId) return;
    setOpening(businessId);
    setFailed(false);
    // Unsaved AI settings belong to the business being left.
    await flushAutosave();
    const { ok } = await switchBusiness(businessId).catch(() => ({ ok: false }));
    if (ok) {
      // A full load from the dashboard home, so no page keeps the other business's data.
      window.location.assign(DASH.home);
      return;
    }
    setOpening(null);
    setFailed(true);
  }

  return (
    <div className="mb-1 border-b border-border2 pb-1">
      <div className="px-2.5 pb-1 pt-1.5 text-[11px] uppercase tracking-wide text-faint">
        {t({ ka: "ბიზნესები", en: "Businesses" })}
      </div>
      <ul className="max-h-[208px] overflow-y-auto">
        {account.businesses.map((b) => {
          const current = b.id === account.businessId;
          return (
            <li key={b.id}>
              <button
                type="button"
                onClick={() => open(b.id)}
                disabled={opening !== null}
                aria-current={current ? "true" : undefined}
                className="flex w-full items-center gap-2.5 rounded-[6px] px-2.5 py-2 text-left hover:bg-soft disabled:cursor-wait"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-[8px] bg-blue-surface text-[12px] font-semibold text-blue">
                  {initialOf(b.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium">{b.name}</span>
                  <span className="block text-[11px] text-muted">{t(ROLE_LABEL[b.role])}</span>
                </span>
                {opening === b.id ? (
                  <IconLoader2 size={16} className="shrink-0 animate-spin text-muted" />
                ) : current ? (
                  <IconCheck size={16} className="shrink-0 text-blue" />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      {failed ? (
        <p role="alert" className="px-2.5 py-1 text-[12px] text-red">
          {t({ ka: "გადართვა ვერ მოხერხდა. სცადე ხელახლა.", en: "Could not switch. Try again." })}
        </p>
      ) : null}
      {adding ? (
        <AddBusinessForm onCancel={() => setAdding(false)} />
      ) : owned >= MAX_OWNED_BUSINESSES ? (
        <p className="px-2.5 py-2 text-[12px] text-muted">{t(OWNED_LIMIT_TEXT)}</p>
      ) : (
        <button
          type="button"
          onClick={() => {
            setAdding(true);
            setFailed(false);
          }}
          className="flex w-full items-center gap-2.5 rounded-[6px] px-2.5 py-2 text-[13px] text-blue hover:bg-soft"
        >
          <IconPlus size={17} /> {t({ ka: "ბიზნესის დამატება", en: "Add business" })}
        </button>
      )}
    </div>
  );
}

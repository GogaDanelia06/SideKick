"use client";

import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import { switchBusiness } from "@/lib/dashboard/actions/businesses";
import { MAX_OWNED_BUSINESSES, OWNED_LIMIT_TEXT } from "@/lib/dashboard/businesses";
import type { Account } from "@/lib/dashboard/queries/account";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { AddBusinessForm } from "./AddBusinessForm";
import { DeleteBusinessForm } from "./DeleteBusinessForm";
import { SwitcherRow } from "./SwitcherRow";
import { useBusinessChange } from "./useBusinessChange";

/** Every business the user belongs to, one click apart, like switching accounts in Gmail. */
export function BusinessSwitcher({ account, onDone }: { account: Account; onDone?: () => void }) {
  const { t } = useLanguage();
  const { settled } = useBusinessChange(onDone);
  const [opening, setOpening] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(null);
  // Hidden at once; the refreshed list soon leaves them out anyway.
  const [removed, setRemoved] = useState<string[]>([]);
  const businesses = account.businesses.filter((b) => !removed.includes(b.id));
  const owned = businesses.filter((b) => b.role === "OWNER").length;

  async function open({ id: businessId, name }: { id: string; name: string }) {
    if (opening || businessId === account.businessId) return;
    setOpening(businessId);
    setFailed(false);
    // Unsaved AI settings belong to the business being left.
    const { ok } = await switchBusiness(businessId).catch(() => ({ ok: false }));
    if (ok) {
      settled(t({ ka: `„${name}“ გაიხსნა`, en: `Opened "${name}"` }));
      return;
    }
    setOpening(null);
    setFailed(true);
  }

  function deleted(businessId: string, message: string) {
    setRemoved((ids) => [...ids, businessId]);
    setDeleting(null);
    // The menu stays open, so the owner sees the list without it.
    settled(message, { keepOpen: true });
  }

  return (
    <div className="mb-1 border-b border-border2 pb-1">
      <div className="px-2.5 pb-1 pt-1.5 text-[11px] uppercase tracking-wide text-faint">
        {t({ ka: "ბიზნესები", en: "Businesses" })}
      </div>
      <ul className="max-h-[208px] overflow-y-auto">
        {businesses.map((b) => (
          <SwitcherRow
            key={b.id}
            business={b}
            current={b.id === account.businessId}
            opening={opening === b.id}
            busy={opening !== null}
            onOpen={() => open(b)}
            // The server has the final word (teammates, payments); this only hides what can never work.
            onDelete={
              b.role === "OWNER" && businesses.length > 1
                ? () => {
                    setDeleting({ id: b.id, name: b.name });
                    setAdding(false);
                    setFailed(false);
                  }
                : undefined
            }
          />
        ))}
      </ul>
      {failed ? (
        <p role="alert" className="px-2.5 py-1 text-[12px] text-red">
          {t({ ka: "გადართვა ვერ მოხერხდა. სცადე ხელახლა.", en: "Could not switch. Try again." })}
        </p>
      ) : null}
      {deleting ? (
        <DeleteBusinessForm
          business={deleting}
          onCancel={() => setDeleting(null)}
          onSettled={(message) => deleted(deleting.id, message)}
        />
      ) : adding ? (
        <AddBusinessForm taken={businesses.map((b) => b.name)} onCancel={() => setAdding(false)} onSettled={settled} />
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

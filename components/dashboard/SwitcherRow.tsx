"use client";

import { IconCheck, IconLoader2, IconTrash } from "@tabler/icons-react";
import type { Role } from "@prisma/client";
import { ROLE_LABEL } from "@/lib/dashboard/businesses";
import { initialOf } from "@/lib/i18n/initial";
import { useLanguage } from "@/lib/i18n/useLanguage";

type Props = {
  business: { id: string; name: string; role: Role };
  current: boolean;
  opening: boolean;
  busy: boolean;
  onOpen: () => void;
  /** Absent when this business cannot be deleted from here. */
  onDelete?: () => void;
};

/** One business in the switcher: open it with a click, or delete it with the bin. */
export function SwitcherRow({ business, current, opening, busy, onOpen, onDelete }: Props) {
  const { t } = useLanguage();

  return (
    <li className="flex items-center">
      <button
        type="button"
        onClick={onOpen}
        disabled={busy}
        aria-current={current ? "true" : undefined}
        className="flex min-w-0 flex-1 items-center gap-2.5 rounded-[6px] px-2.5 py-2 text-left hover:bg-soft disabled:cursor-wait"
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-[8px] bg-blue-surface text-[12px] font-semibold text-blue">
          {initialOf(business.name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium">{business.name}</span>
          <span className="block text-[11px] text-muted">{t(ROLE_LABEL[business.role])}</span>
        </span>
        {opening ? (
          <IconLoader2 size={16} className="shrink-0 animate-spin text-muted" />
        ) : current ? (
          <IconCheck size={16} className="shrink-0 text-blue" />
        ) : null}
      </button>
      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          aria-label={`${t("dashboard.switcherRow.delete")}: ${business.name}`}
          className="grid size-8 shrink-0 place-items-center rounded-[6px] text-faint hover:bg-red-surface hover:text-red"
        >
          <IconTrash size={15} />
        </button>
      ) : null}
    </li>
  );
}

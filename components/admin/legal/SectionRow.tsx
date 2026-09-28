"use client";

import type { LegalSection } from "@prisma/client";
import {
  IconChevronDown,
  IconChevronUp,
  IconEye,
  IconEyeOff,
  IconLanguageOff,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { readsInEnglish } from "@/lib/content/legalSections";
import { toItems } from "@/lib/content/legalBlocks";
import { useLanguage } from "@/lib/i18n/useLanguage";

const ICON = "grid size-8 place-items-center rounded-[7px] border border-border text-muted hover:text-ink";

/** One section as the list shows it: what it says, and what the public page will do with it. */
export function SectionRow({
  section,
  first,
  last,
  busy,
  onMove,
  onPublish,
  onEdit,
  onRemove,
  index,
}: {
  section: LegalSection;
  index: number;
  first: boolean;
  last: boolean;
  busy: boolean;
  onMove: (where: "up" | "down") => void;
  onPublish: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { t } = useLanguage();
  const bullets = toItems(section.bulletsKa).length;
  // Written in English too, or the page shows this section in Georgian (lib/content/legalSections.ts).
  const translated = readsInEnglish(section);

  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 w-6 shrink-0 text-center font-mono text-[12px] text-faint">{index + 1}</span>

      <div className="min-w-0 flex-1">
        <div className={section.published ? "text-sm font-medium" : "text-sm font-medium text-muted line-through"}>
          {section.headingKa}
        </div>
        <div className="mt-0.5 line-clamp-2 text-[13px] text-muted">{section.bodyKa}</div>

        {bullets > 0 ? (
          <div className="mt-1 text-[12px] text-faint">
            • {bullets} {t("admin.legal.editor.bullets")}
          </div>
        ) : null}

        {translated ? null : (
          <div className="mt-1.5 flex items-start gap-1.5 text-[12px] text-amber">
            <IconLanguageOff size={14} className="mt-px shrink-0" />
            {t("admin.legal.editor.englishDoesNotLine")}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button type="button" disabled={busy || first} onClick={() => onMove("up")} aria-label={t("admin.legal.editor.moveUp")} className={`${ICON} disabled:opacity-30`}>
          <IconChevronUp size={16} />
        </button>
        <button type="button" disabled={busy || last} onClick={() => onMove("down")} aria-label={t("admin.legal.editor.moveDown")} className={`${ICON} disabled:opacity-30`}>
          <IconChevronDown size={16} />
        </button>
        <button type="button" disabled={busy} onClick={onPublish} aria-label={t("admin.legal.editor.togglePublish")} className={`${ICON} disabled:opacity-40`}>
          {section.published ? <IconEye size={15} /> : <IconEyeOff size={15} />}
        </button>
        <button type="button" disabled={busy} onClick={onEdit} aria-label={t("admin.legal.editor.edit")} className={`${ICON} disabled:opacity-40`}>
          <IconPencil size={15} />
        </button>
        <button type="button" disabled={busy} onClick={onRemove} aria-label={t("admin.legal.editor.delete")} className={`${ICON} border-border text-red hover:border-red disabled:opacity-40`}>
          <IconTrash size={15} />
        </button>
      </div>
    </div>
  );
}

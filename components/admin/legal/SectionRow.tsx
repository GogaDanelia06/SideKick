"use client";

import type { LegalSection } from "@prisma/client";
import { IconLanguageOff } from "@tabler/icons-react";
import { RowTools, type RowLabels } from "@/components/admin/ui/RowTools";
import { readsInEnglish } from "@/lib/content/legalSections";
import { toItems } from "@/lib/content/legalBlocks";
import { useLanguage } from "@/lib/i18n/useLanguage";

const TOOLS: RowLabels = {
  up: "admin.legal.editor.moveUp",
  down: "admin.legal.editor.moveDown",
  toggle: "admin.legal.editor.togglePublish",
  edit: "admin.legal.editor.edit",
  remove: "admin.legal.editor.delete",
};

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

        {readsInEnglish(section) ? null : (
          <div className="mt-1.5 flex items-start gap-1.5 text-[12px] text-amber">
            <IconLanguageOff size={14} className="mt-px shrink-0" />
            {t("admin.legal.editor.englishDoesNotLine")}
          </div>
        )}
      </div>

      <RowTools
        first={first}
        last={last}
        pending={busy}
        published={section.published}
        labels={TOOLS}
        onMove={onMove}
        onToggle={onPublish}
        onEdit={onEdit}
        onRemove={onRemove}
      />
    </div>
  );
}

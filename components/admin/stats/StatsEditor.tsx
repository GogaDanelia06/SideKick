"use client";

import type { SiteStat } from "@prisma/client";
import { createStat, updateStat, deleteStat, moveStat } from "@/lib/admin/actions/stats";
import { AddForm, EditForm } from "@/components/admin/ui/EditorForms";
import { EditorBar, EmptyState, ItemCard } from "@/components/admin/ui/EditorParts";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useListEditor } from "@/components/admin/ui/useListEditor";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { StatSourceOption } from "@/lib/site/statFormat";
import type { Text } from "@/lib/i18n/messages";
import { StatFields } from "./StatFields";
import { StatRow } from "./StatRow";
import { fieldsOf } from "./statForm";

const ERRORS: Record<string, Text> = {
  all_fields_required: "admin.stats.editor.fillInEveryField",
  not_found: "admin.stats.editor.notFound",
  unknown_source: "admin.stats.editor.pickACounter",
  bad_mode: "admin.stats.editor.pickHowTheFigure",
  value_required: "admin.stats.editor.typeAFigure",
};

export function StatsEditor({
  stats,
  sources,
}: {
  stats: SiteStat[];
  sources: StatSourceOption[];
}) {
  const { t } = useLanguage();
  const editor = useListEditor(stats, deleteStat);

  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-[8px] border border-border2 bg-soft px-3.5 py-2.5 text-[12px] text-muted">
        {t("admin.stats.editor.theStripAtThe")}
      </p>

      <EditorBar
        count={editor.visible.length}
        noun="admin.stats.editor.stats"
        adding={editor.adding}
        addLabel="admin.stats.editor.addStat"
        closeLabel="admin.stats.editor.close"
        onToggle={editor.toggleAdding}
      />

      {editor.error ? <ErrorBanner>{t(ERRORS[editor.error] ?? "admin.stats.editor.somethingWentWrong")}</ErrorBanner> : null}

      {editor.adding ? (
        <AddForm create={createStat} run={editor.run} onDone={editor.closeAdding} pending={editor.pending} label="admin.stats.editor.add">
          <StatFields sources={sources} />
        </AddForm>
      ) : null}

      {editor.visible.length === 0 && !editor.adding ? <EmptyState>{t("admin.stats.editor.noStatsYetThe")}</EmptyState> : null}

      <div className="flex flex-col gap-2.5">
        {editor.visible.map((s, i) => (
          <ItemCard key={s.id}>
            {editor.editing === s.id ? (
              <EditForm
                update={(fd) => updateStat(s.id, fd)}
                run={editor.run}
                onDone={editor.finishEditing}
                onCancel={editor.cancelEditing}
                pending={editor.pending}
                labels={{ cancel: "admin.stats.editor.cancel", save: "admin.stats.editor.save" }}
              >
                <StatFields initial={fieldsOf(s)} sources={sources} />
              </EditForm>
            ) : (
              <StatRow
                stat={s}
                sources={sources}
                first={i === 0}
                last={i === stats.length - 1}
                pending={editor.pending}
                onMove={(direction) => editor.run(() => moveStat(s.id, direction))}
                onEdit={() => editor.startEditing(s.id)}
                onRemove={() => editor.remove(s.id)}
              />
            )}
          </ItemCard>
        ))}
      </div>
    </div>
  );
}

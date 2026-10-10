"use client";

import type { Tutorial } from "@prisma/client";
import { IconPlus, IconX } from "@tabler/icons-react";
import { createTutorial, updateTutorial, deleteTutorial, moveTutorial, toggleTutorialPublished } from "@/lib/admin/actions/tutorials";
import { AddForm, EditForm } from "@/components/admin/ui/EditorForms";
import { EmptyState, ItemCard } from "@/components/admin/ui/EditorParts";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useListEditor } from "@/components/admin/ui/useListEditor";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";
import { TutorialFields } from "./TutorialFields";
import { TutorialRow } from "./TutorialRow";

const ERRORS: Record<string, Text> = {
  title_required: "admin.tutorials.editor.georgianTitleIsRequired",
  bad_url: "admin.tutorials.editor.enterAValidYoutube",
  not_found: "admin.tutorials.editor.notFound",
};

export function TutorialsEditor({ tutorials }: { tutorials: Tutorial[] }) {
  const { t } = useLanguage();
  const editor = useListEditor(tutorials, deleteTutorial);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm text-muted">
            {tutorials.length} {t("admin.tutorials.editor.videos")}
          </div>
          <p className="mt-0.5 text-[12px] text-faint">
            {t("admin.tutorials.editor.everyBusinessSeesThese")}
          </p>
        </div>
        <button
          type="button"
          onClick={editor.toggleAdding}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[8px] bg-ink px-4 text-[13px] font-medium text-canvas"
        >
          {editor.adding ? <IconX size={16} /> : <IconPlus size={16} />}
          {editor.adding ? t("admin.tutorials.editor.close") : t("admin.tutorials.editor.addVideo")}
        </button>
      </div>

      {editor.error ? <ErrorBanner>{t(ERRORS[editor.error] ?? "admin.tutorials.editor.somethingWentWrong")}</ErrorBanner> : null}

      {editor.adding ? (
        <AddForm create={createTutorial} run={editor.run} onDone={editor.closeAdding} pending={editor.pending} label="admin.tutorials.editor.add">
          <TutorialFields />
        </AddForm>
      ) : null}

      {tutorials.length === 0 && !editor.adding ? <EmptyState>{t("admin.tutorials.editor.noVideosYet")}</EmptyState> : null}

      <div className="flex flex-col gap-2.5">
        {editor.visible.map((v, i) => (
          <ItemCard key={v.id}>
            {editor.editing === v.id ? (
              <EditForm
                update={(fd) => updateTutorial(v.id, fd)}
                run={editor.run}
                onDone={editor.finishEditing}
                onCancel={editor.cancelEditing}
                pending={editor.pending}
                labels={{ cancel: "admin.tutorials.editor.cancel", save: "admin.tutorials.editor.save" }}
              >
                <TutorialFields initial={v} />
              </EditForm>
            ) : (
              <TutorialRow
                video={v}
                first={i === 0}
                last={i === tutorials.length - 1}
                pending={editor.pending}
                onMove={(direction) => editor.run(() => moveTutorial(v.id, direction))}
                onToggle={() => editor.run(() => toggleTutorialPublished(v.id, !v.published))}
                onEdit={() => editor.startEditing(v.id)}
                onRemove={() => editor.remove(v.id)}
              />
            )}
          </ItemCard>
        ))}
      </div>
    </div>
  );
}

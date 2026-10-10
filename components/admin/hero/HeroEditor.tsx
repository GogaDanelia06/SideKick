"use client";

import { createSlide, updateSlide, deleteSlide, moveSlide, toggleSlidePublished } from "@/lib/admin/actions/hero";
import { AddForm, EditForm } from "@/components/admin/ui/EditorForms";
import { EditorBar, EmptyState, ItemCard } from "@/components/admin/ui/EditorParts";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { RowTools, type RowLabels } from "@/components/admin/ui/RowTools";
import { useListEditor } from "@/components/admin/ui/useListEditor";
import type { StatSourceOption } from "@/lib/site/statFormat";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";
import { HeroInterval } from "./HeroInterval";
import { SlideFields } from "./SlideFields";
import { SlideStats } from "./SlideStats";
import type { SlideWithStats } from "./types";

export type { SlideWithStats } from "./types";

const ERRORS: Record<string, Text> = {
  title_required: "admin.hero.editor.titleIsRequiredIn",
  bad_interval: "admin.hero.editor.secondsMustBeBetween",
  not_found: "admin.hero.editor.notFound",
};

const TOOLS: RowLabels = {
  up: "admin.hero.editor.moveUp",
  down: "admin.hero.editor.moveDown",
  toggle: "admin.hero.editor.togglePublish",
  edit: "admin.hero.editor.edit",
  remove: "admin.hero.editor.delete",
};

export function HeroEditor({
  slides,
  intervalSeconds,
  sources,
}: {
  slides: SlideWithStats[];
  intervalSeconds: number;
  sources: StatSourceOption[];
}) {
  const { t } = useLanguage();
  const editor = useListEditor(slides, deleteSlide);

  return (
    <div className="flex flex-col gap-4">
      <HeroInterval seconds={intervalSeconds} pending={editor.pending} run={editor.run} />

      <EditorBar
        count={slides.length}
        noun="admin.hero.editor.slides"
        adding={editor.adding}
        addLabel="admin.hero.editor.addSlide"
        closeLabel="admin.hero.editor.close"
        onToggle={editor.toggleAdding}
      />

      {editor.error ? <ErrorBanner>{t(ERRORS[editor.error] ?? "admin.hero.editor.somethingWentWrong")}</ErrorBanner> : null}

      {editor.adding ? (
        <AddForm create={createSlide} run={editor.run} onDone={editor.closeAdding} pending={editor.pending} label="admin.hero.editor.add">
          <SlideFields />
        </AddForm>
      ) : null}

      {slides.length === 0 && !editor.adding ? <EmptyState>{t("admin.hero.editor.noSlidesYetThe")}</EmptyState> : null}

      <div className="flex flex-col gap-2.5">
        {editor.visible.map((s, i) => (
          <ItemCard key={s.id}>
            {editor.editing === s.id ? (
              <EditForm
                update={(fd) => updateSlide(s.id, fd)}
                run={editor.run}
                onDone={editor.finishEditing}
                onCancel={editor.cancelEditing}
                pending={editor.pending}
                labels={{ cancel: "admin.hero.editor.cancel", save: "admin.hero.editor.save" }}
              >
                <SlideFields initial={s} />
              </EditForm>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 w-6 shrink-0 text-center font-mono text-[12px] text-faint">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className={s.published ? "text-sm font-medium" : "text-sm font-medium text-muted line-through"}>
                      {s.titleKa}
                    </div>
                    <div className="mt-0.5 line-clamp-1 text-[13px] text-muted">{s.textKa}</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-faint">
                      <span>{s.mediaUrl ? t("admin.hero.editor.media") : s.mock || t("admin.hero.editor.noMedia")}</span>
                      <span>·</span>
                      <span>{s.ctaUrl}</span>
                    </div>
                  </div>
                  <RowTools
                    first={i === 0}
                    last={i === slides.length - 1}
                    pending={editor.pending}
                    published={s.published}
                    labels={TOOLS}
                    onMove={(direction) => editor.run(() => moveSlide(s.id, direction))}
                    onToggle={() => editor.run(() => toggleSlidePublished(s.id, !s.published))}
                    onEdit={() => editor.startEditing(s.id)}
                    onRemove={() => editor.remove(s.id)}
                  />
                </div>
                <SlideStats slideId={s.id} stats={s.stats} sources={sources} />
              </>
            )}
          </ItemCard>
        ))}
      </div>
    </div>
  );
}

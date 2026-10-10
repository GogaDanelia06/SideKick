"use client";

import { createBox, updateBox, deleteBox, moveBox, toggleBoxPublished } from "@/lib/admin/actions/boxes";
import { AddForm, EditForm } from "@/components/admin/ui/EditorForms";
import { EditorBar, EmptyState, ItemCard } from "@/components/admin/ui/EditorParts";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { RowTools, type RowLabels } from "@/components/admin/ui/RowTools";
import { useListEditor } from "@/components/admin/ui/useListEditor";
import type { BoxKind } from "@/lib/admin/forms/content";
import { resolveIcon } from "@/lib/content/icons";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";
import { BoxFields, type BoxItem } from "./BoxFields";

export type { BoxItem } from "./BoxFields";

const ERRORS: Record<string, Text> = {
  title_required: "admin.boxes.editor.titleIsRequiredIn",
  not_found: "admin.boxes.editor.notFound",
};

const TOOLS: RowLabels = {
  up: "admin.boxes.editor.moveUp",
  down: "admin.boxes.editor.moveDown",
  toggle: "admin.boxes.editor.togglePublish",
  edit: "admin.boxes.editor.edit",
  remove: "admin.boxes.editor.delete",
};

export function BoxesEditor({ kind, items }: { kind: BoxKind; items: BoxItem[] }) {
  const { t } = useLanguage();
  const editor = useListEditor(items, (id) => deleteBox(kind, id));

  return (
    <div className="flex flex-col gap-4">
      <EditorBar
        count={items.length}
        noun="admin.boxes.editor.boxes"
        adding={editor.adding}
        addLabel="admin.boxes.editor.addBox"
        closeLabel="admin.boxes.editor.close"
        onToggle={editor.toggleAdding}
      />

      {editor.error ? <ErrorBanner>{t(ERRORS[editor.error] ?? "admin.boxes.editor.somethingWentWrong")}</ErrorBanner> : null}

      {editor.adding ? (
        <AddForm
          create={(fd) => createBox(kind, fd)}
          run={editor.run}
          onDone={editor.closeAdding}
          pending={editor.pending}
          label="admin.boxes.editor.add"
        >
          <BoxFields />
        </AddForm>
      ) : null}

      {items.length === 0 && !editor.adding ? <EmptyState>{t("admin.boxes.editor.noBoxesYet")}</EmptyState> : null}

      <div className="flex flex-col gap-2.5">
        {editor.visible.map((b, i) => {
          const Ico = resolveIcon(b.icon);
          return (
            <ItemCard key={b.id}>
              {editor.editing === b.id ? (
                <EditForm
                  update={(fd) => updateBox(kind, b.id, fd)}
                  run={editor.run}
                  onDone={editor.finishEditing}
                  onCancel={editor.cancelEditing}
                  pending={editor.pending}
                  labels={{ cancel: "admin.boxes.editor.cancel", save: "admin.boxes.editor.save" }}
                >
                  <BoxFields initial={b} />
                </EditForm>
              ) : (
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-blue-surface text-blue">
                    <Ico size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className={b.published ? "text-sm font-medium" : "text-sm font-medium text-muted line-through"}>
                      {b.titleKa}
                    </div>
                    <div className="mt-0.5 line-clamp-2 text-[13px] text-muted">{b.bodyKa}</div>
                  </div>
                  <RowTools
                    first={i === 0}
                    last={i === items.length - 1}
                    pending={editor.pending}
                    published={b.published}
                    labels={TOOLS}
                    onMove={(direction) => editor.run(() => moveBox(kind, b.id, direction))}
                    onToggle={() => editor.run(() => toggleBoxPublished(kind, b.id, !b.published))}
                    onEdit={() => editor.startEditing(b.id)}
                    onRemove={() => editor.remove(b.id)}
                  />
                </div>
              )}
            </ItemCard>
          );
        })}
      </div>
    </div>
  );
}

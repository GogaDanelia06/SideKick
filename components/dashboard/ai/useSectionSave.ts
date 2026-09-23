"use client";

import { useContext, useEffect, useEffectEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/dashboard/ui/Toast";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { dropDraft, readDraft, writeDraft } from "@/lib/dashboard/sectionSave/drafts";
import { applyFields, changedFields, readFields, toEntries, type Fields } from "@/lib/dashboard/sectionSave/fields";
import type { SectionKey } from "@/lib/dashboard/sectionSave/request";
import { sendSave } from "@/lib/dashboard/sectionSave/send";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { SectionOwnerContext } from "./sectionOwner";
import { SAVED, SAVE_OUTCOME } from "./saveMessages";
import type { Text } from "@/lib/i18n/messages";

/**
 * A section of the AI page saves when the user says so — nothing is sent while they type.
 * Until a save goes through, whatever they changed is kept in this browser, so another
 * section, a lost connection or a closed tab never takes it away: the section offers it
 * back the next time it opens, and the browser asks before the page is left behind.
 */
export function useSectionSave(section: SectionKey, title: Text) {
  const owner = useContext(SectionOwnerContext);
  const formRef = useRef<HTMLFormElement>(null);
  /** The form as the server has it, as far as this page knows. */
  const saved = useRef<Fields | null>(null);
  /** What the draft in this browser holds, so it is only written when it would differ. */
  const kept = useRef("");
  const [restored, setRestored] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const { t } = useLanguage();
  const notify = useToast();
  const router = useRouter();

  useUnsavedChanges(dirty);

  /** Whether the form still differs from the server, and a copy of what differs. */
  const sync = useEffectEvent(() => {
    const form = formRef.current;
    if (!form || !owner || saved.current === null) return;
    const changed = changedFields(saved.current, readFields(form));
    setDirty(changed !== null);

    const stamp = changed ? JSON.stringify(changed) : "";
    if (stamp === kept.current) return;
    kept.current = stamp;
    if (changed) writeDraft({ ...owner, section }, changed);
    else dropDraft({ ...owner, section });
  });

  useEffect(() => {
    const form = formRef.current;
    if (!form || !owner) return;
    const place = { ...owner, section };

    // Once per mount; a section hidden for another one keeps what was typed in it.
    if (saved.current === null) {
      saved.current = readFields(form);
      const draft = readDraft(place);
      if (draft && changedFields(saved.current, { ...saved.current, ...draft.fields })) {
        applyFields(form, draft.fields);
        setRestored(true);
      } else if (draft) {
        dropDraft(place);
      }
    }

    const onEdit = () => sync();
    form.addEventListener("input", onEdit);
    form.addEventListener("change", onEdit);
    return () => {
      form.removeEventListener("input", onEdit);
      form.removeEventListener("change", onEdit);
    };
  }, [owner, section]);

  // Every render, because React fills fields itself too — a prompt written by the AI,
  // a restored draft — and neither of those is an edit the browser reports.
  useEffect(sync);

  async function save() {
    const form = formRef.current;
    if (!form || !owner || saving) return;
    const place = { ...owner, section };
    const now = readFields(form);
    const changed = saved.current ? changedFields(saved.current, now) : null;
    if (!changed) return setDirty(false);

    setSaving(true);
    const outcome = await sendSave({ ...place, entries: toEntries(now) });
    setSaving(false);
    if (!outcome.ok) return notify(t(SAVE_OUTCOME[outcome.error]), "error");

    saved.current = now;
    setRestored(false);
    notify(`${t(SAVED)}: ${t(title)}`);
    // Fresh server data everywhere, so the rest of the dashboard shows the new values too.
    router.refresh();
  }

  /** Puts the fields back the way the server has them. */
  function cancel() {
    const form = formRef.current;
    if (!form || !saved.current || saving) return;
    applyFields(form, saved.current);
    setRestored(false);
  }

  return { formRef, restored, dirty, saving, save, cancel };
}

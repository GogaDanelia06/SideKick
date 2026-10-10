"use client";

import { useContext, useEffect, useEffectEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/dashboard/ui/Toast";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { dropDraft, restoreDraft, writeDraft } from "@/lib/dashboard/sectionSave/drafts";
import { applyFields, changedFields, readFields, toEntries, type Fields } from "@/lib/dashboard/sectionSave/fields";
import type { SectionKey } from "@/lib/dashboard/sectionSave/request";
import { sendSave } from "@/lib/dashboard/sectionSave/send";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { SectionOwnerContext } from "./sectionOwner";
import { SAVED, SAVE_OUTCOME } from "./saveMessages";
import type { Text } from "@/lib/i18n/messages";

export function useSectionSave(section: SectionKey, title: Text) {
  const owner = useContext(SectionOwnerContext);
  const formRef = useRef<HTMLFormElement>(null);
  const saved = useRef<Fields | null>(null);
  const kept = useRef("");
  const [restored, setRestored] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const { t } = useLanguage();
  const notify = useToast();
  const router = useRouter();

  useUnsavedChanges(dirty);

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

    if (saved.current === null) {
      saved.current = readFields(form);
      if (restoreDraft(form, { ...owner, section }, saved.current)) setRestored(true);
    }

    const onEdit = () => sync();
    form.addEventListener("input", onEdit);
    form.addEventListener("change", onEdit);
    return () => {
      form.removeEventListener("input", onEdit);
      form.removeEventListener("change", onEdit);
    };
  }, [owner, section]);

  useEffect(sync);

  async function save(): Promise<boolean> {
    const form = formRef.current;
    if (!form || !owner || saving) return false;
    const now = readFields(form);
    const changed = saved.current ? changedFields(saved.current, now) : null;
    if (!changed) {
      setDirty(false);
      return true;
    }

    setSaving(true);
    const outcome = await sendSave({ ...owner, section, entries: toEntries(now) });
    setSaving(false);
    if (!outcome.ok) {
      notify(t(SAVE_OUTCOME[outcome.error]), "error");
      return false;
    }

    saved.current = now;
    setRestored(false);
    notify(`${t(SAVED)}: ${t(title)}`);
    router.refresh();
    return true;
  }

  function cancel() {
    const form = formRef.current;
    if (!form || !saved.current || saving) return;
    applyFields(form, saved.current);
    setRestored(false);
  }

  return { formRef, restored, dirty, saving, save, cancel };
}

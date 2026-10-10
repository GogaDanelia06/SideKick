"use client";

import { useRef } from "react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { INPUT } from "./leadConfig";

export function AddLeadForm({
  pending,
  add,
  onDone,
}: {
  pending: boolean;
  add: (fd: FormData, after: () => void) => void;
  onDone: () => void;
}) {
  const { t } = useLanguage();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Panel className="p-4">
      <form
        ref={formRef}
        action={(fd) =>
          add(fd, () => {
            formRef.current?.reset();
            onDone();
          })
        }
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <input name="name" required placeholder={t("dashboard.leads.view.name2")} className={INPUT} />
        <input name="phone" placeholder={t("dashboard.leads.view.phone")} className={INPUT} />
        <input name="interest" placeholder={t("dashboard.leads.view.interest")} className={INPUT} />
        <input name="source" placeholder={t("dashboard.leads.view.source")} className={INPUT} />
        <input
          name="comment"
          placeholder={t("dashboard.leads.view.comment")}
          className={`${INPUT} sm:col-span-2 lg:col-span-3`}
        />
        <button
          type="submit"
          disabled={pending}
          className="h-9 rounded-[8px] bg-primary text-[13px] font-medium text-white disabled:opacity-60"
        >
          {pending ? "…" : t("dashboard.leads.view.save")}
        </button>
      </form>
    </Panel>
  );
}

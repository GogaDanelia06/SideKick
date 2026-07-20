"use client";

import type { AiConfig, Faq } from "@prisma/client";
import { Panel } from "@/components/dashboard/ui/Panel";
import { saveAiConfig } from "@/lib/dashboard/actions";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";

const STYLE = ["მეგობრული", "პროფესიონალური", "ოფიციალური", "გაყიდვებზე ორიენტირებული", "კონსულტანტის სტილი"];
const LENGTH = ["მოკლე", "საშუალო", "დეტალური"];
const EMOJI = ["არასოდეს", "ზომიერად", "ხშირად"];
const ADDR = ["ფორმალური", "ფამილიარული"];
const ROLES: { key: string; label: Bilingual }[] = [
  { key: "info", label: { ka: "ინფო აგენტი", en: "Info" } },
  { key: "sales", label: { ka: "გაყიდვები", en: "Sales" } },
  { key: "leads", label: { ka: "ლიდები", en: "Leads" } },
  { key: "booking", label: { ka: "ჯავშანი", en: "Booking" } },
  { key: "orders", label: { ka: "შეკვეთები", en: "Orders" } },
  { key: "support", label: { ka: "მხარდაჭერა", en: "Support" } },
];

function Select({ name, label, value, options }: { name: string; label: Bilingual; value: string | null; options: string[] }) {
  const { t } = useLanguage();
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-xs text-muted">{t(label)}</span>
      <select name={name} defaultValue={value ?? options[0]} className="h-10 w-full rounded-[8px] border border-input bg-canvas px-3 text-sm outline-none focus:border-blue">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

export function AiView({ config }: { config: AiConfig | null; faqs: Faq[] }) {
  const { t } = useLanguage();
  const roles = config?.roles ?? [];

  return (
    <form action={saveAiConfig} className="grid gap-4">
      <Panel className="grid gap-4 p-5">
        <h3 className="text-sm font-semibold">{t({ ka: "ხასიათი", en: "Character" })}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select name="style" label={{ ka: "სტილი", en: "Style" }} value={config?.style ?? null} options={STYLE} />
          <Select name="length" label={{ ka: "პასუხის სიგრძე", en: "Length" }} value={config?.length ?? null} options={LENGTH} />
          <Select name="emoji" label={{ ka: "ემოჯები", en: "Emoji" }} value={config?.emoji ?? null} options={EMOJI} />
          <Select name="addressForm" label={{ ka: "მიმართვა", en: "Address form" }} value={config?.addressForm ?? null} options={ADDR} />
        </div>
      </Panel>
      <Panel className="p-5">
        <h3 className="mb-3 text-sm font-semibold">{t({ ka: "როლები", en: "Roles" })}</h3>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <label key={r.key} className="flex cursor-pointer items-center gap-2 rounded-[8px] border border-border px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-green-surface has-[:checked]:text-green">
              <input type="checkbox" name="roles" value={r.key} defaultChecked={roles.includes(r.key)} className="accent-[var(--primary)]" />
              {t(r.label)}
            </label>
          ))}
        </div>
      </Panel>
      <Panel className="p-5">
        <h3 className="mb-1 text-sm font-semibold">{t({ ka: "პრომპტი / ინსტრუქციები", en: "Prompt / instructions" })}</h3>
        <p className="mb-3 text-xs text-muted">{t({ ka: "ბოტის საბაზისო ინსტრუქცია.", en: "The bot's base instruction." })}</p>
        <textarea name="prompt" defaultValue={config?.prompt ?? ""} rows={6} className="w-full rounded-[8px] border border-input bg-canvas p-3 text-sm outline-none focus:border-blue" />
      </Panel>
      <div className="flex justify-end">
        <button type="submit" className="rounded-[8px] bg-primary px-5 py-2.5 text-sm font-medium text-white">{t({ ka: "შენახვა", en: "Save" })}</button>
      </div>
    </form>
  );
}

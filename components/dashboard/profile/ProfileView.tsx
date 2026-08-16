"use client";

import type { Business } from "@prisma/client";
import { Panel } from "@/components/dashboard/ui/Panel";
import { saveProfile } from "@/lib/dashboard/actions";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual } from "@/lib/content/types";
import type { ProfileUser } from "@/lib/dashboard/queries";

function Field({ name, label, defaultValue, disabled }: { name: string; label: Bilingual; defaultValue: string; disabled?: boolean }) {
  const { t } = useLanguage();
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-xs text-muted">{t(label)}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        disabled={disabled}
        className="h-10 w-full rounded-[8px] border border-input bg-canvas px-3 text-sm outline-none focus:border-blue disabled:opacity-60"
      />
    </label>
  );
}

export function ProfileView({ user, business }: { user: ProfileUser | null; business: Business | null }) {
  const { t } = useLanguage();

  return (
    <form action={saveProfile} className="grid gap-4 lg:grid-cols-2">
      <Panel className="grid gap-4 p-5">
        <h3 className="text-sm font-semibold">{t({ ka: "პირადი ინფორმაცია", en: "Personal info" })}</h3>
        <Field name="name" label={{ ka: "სახელი", en: "Name" }} defaultValue={user?.name ?? ""} />
        <Field name="email" label={{ ka: "ელფოსტა", en: "Email" }} defaultValue={user?.email ?? ""} disabled />
        <Field name="phone" label={{ ka: "ტელეფონი", en: "Phone" }} defaultValue={user?.phone ?? ""} />
      </Panel>
      <Panel className="grid gap-4 p-5">
        <h3 className="text-sm font-semibold">{t({ ka: "ბიზნესის ინფორმაცია", en: "Business info" })}</h3>
        <Field name="company" label={{ ka: "კომპანია", en: "Company" }} defaultValue={business?.name ?? ""} />
        <Field name="field" label={{ ka: "საქმიანობის სფერო", en: "Field" }} defaultValue={business?.field ?? ""} />
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-muted">{t({ ka: "აღწერა", en: "Description" })}</span>
          <textarea
            name="description"
            defaultValue={business?.description ?? ""}
            rows={3}
            className="w-full rounded-[8px] border border-input bg-canvas p-3 text-sm outline-none focus:border-blue"
          />
        </label>
      </Panel>
      <div className="flex justify-end lg:col-span-2">
        <button type="submit" className="rounded-[8px] bg-primary px-5 py-2.5 text-sm font-medium text-white">
          {t({ ka: "შენახვა", en: "Save" })}
        </button>
      </div>
    </form>
  );
}

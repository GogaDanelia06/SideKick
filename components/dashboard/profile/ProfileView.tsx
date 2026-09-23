"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Business } from "@prisma/client";
import { IconDeviceFloppy, IconLoader2 } from "@tabler/icons-react";
import { Panel } from "@/components/dashboard/ui/Panel";
import { useToast } from "@/components/dashboard/ui/Toast";
import { saveProfile, type ProfileResult } from "@/lib/dashboard/actions/profile";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { ProfileUser } from "@/lib/dashboard/queries/account";
import { PROFILE_ERRORS, PROFILE_SAVED, ProfileField } from "./ProfileFields";

export function ProfileView({ user, business }: { user: ProfileUser | null; business: Business | null }) {
  const { t } = useLanguage();
  const notify = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    const result = await saveProfile(new FormData(event.currentTarget)).catch(
      (): ProfileResult => ({ ok: false, error: "failed" }),
    );
    setSaving(false);

    if (!result.ok) return notify(t(PROFILE_ERRORS[result.error]), "error");
    notify(t(PROFILE_SAVED));
    // The name shows in the sidebar and the account menu too.
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-4 lg:grid-cols-2">
      <Panel className="grid gap-4 p-5">
        <h3 className="text-sm font-semibold">{t({ ka: "პირადი ინფორმაცია", en: "Personal info" })}</h3>
        <ProfileField name="name" label={{ ka: "სახელი", en: "Name" }} defaultValue={user?.name ?? ""} />
        <ProfileField name="email" label={{ ka: "ელფოსტა", en: "Email" }} defaultValue={user?.email ?? ""} disabled />
        <ProfileField name="phone" label={{ ka: "ტელეფონი", en: "Phone" }} defaultValue={user?.phone ?? ""} />
      </Panel>

      <Panel className="grid gap-4 p-5">
        <h3 className="text-sm font-semibold">{t({ ka: "ბიზნესის ინფორმაცია", en: "Business info" })}</h3>
        <ProfileField name="company" label={{ ka: "კომპანია", en: "Company" }} defaultValue={business?.name ?? ""} />
        <ProfileField name="field" label={{ ka: "საქმიანობის სფერო", en: "Field" }} defaultValue={business?.field ?? ""} />
        <ProfileField
          name="description"
          label={{ ka: "აღწერა", en: "Description" }}
          defaultValue={business?.description ?? ""}
          rows={3}
        />
      </Panel>

      <div className="flex justify-end lg:col-span-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-[8px] bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {saving ? <IconLoader2 size={16} className="animate-spin" /> : <IconDeviceFloppy size={16} />}
          {t(saving ? { ka: "ინახება…", en: "Saving…" } : { ka: "შენახვა", en: "Save" })}
        </button>
      </div>
    </form>
  );
}

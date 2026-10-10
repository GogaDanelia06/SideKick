"use client";

import {
  IconCalendarPlus,
  IconCheck,
  IconHeadset,
  IconInfoCircle,
  IconShoppingCart,
  IconTrendingUp,
  IconUserPlus,
} from "@tabler/icons-react";
import type { IconType } from "@/lib/content/types";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Text } from "@/lib/i18n/messages";

const ROLES: { key: string; label: Text; icon: IconType }[] = [
  { key: "info", label: "dashboard.ai.rulesSection.informationAgent", icon: IconInfoCircle },
  { key: "sales", label: "dashboard.ai.rulesSection.salesSpecialist", icon: IconTrendingUp },
  { key: "leads", label: "dashboard.ai.rulesSection.leadCollector", icon: IconUserPlus },
  { key: "booking", label: "dashboard.ai.rulesSection.appointmentBooking", icon: IconCalendarPlus },
  { key: "orders", label: "dashboard.ai.rulesSection.orderTaking", icon: IconShoppingCart },
  { key: "support", label: "dashboard.ai.rulesSection.supportAgent", icon: IconHeadset },
];

export function RoleChoices({ selected }: { selected: string[] }) {
  const { t } = useLanguage();

  return (
    <fieldset>
      <legend className="mb-2 text-[13px] font-medium">
        <span className="text-muted">1.</span> {t("dashboard.ai.rulesSection.roles")}
      </legend>
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {ROLES.map((r) => (
          <label
            key={r.key}
            className="flex cursor-pointer items-center gap-2.5 rounded-[10px] border border-border px-3.5 py-3 text-[13px] transition-colors hover:border-blue has-[:checked]:border-primary has-[:checked]:bg-green-surface has-[:checked]:text-green"
          >
            <input
              type="checkbox"
              name="roles"
              value={r.key}
              defaultChecked={selected.includes(r.key)}
              className="peer sr-only"
            />
            <r.icon size={17} className="shrink-0" />
            <span className="flex-1">{t(r.label)}</span>
            <IconCheck size={15} className="hidden shrink-0 peer-checked:block" />
          </label>
        ))}
      </div>
    </fieldset>
  );
}

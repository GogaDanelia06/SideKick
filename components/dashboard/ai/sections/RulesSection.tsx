"use client";

import type { AiConfig } from "@prisma/client";
import {
  IconCalendarPlus,
  IconCheck,
  IconHeadset,
  IconInfoCircle,
  IconListCheck,
  IconShoppingCart,
  IconTrendingUp,
  IconUserPlus,
} from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { IconType } from "@/lib/content/types";
import { AREA, AreaField, CheckRow } from "../parts";
import { SectionForm } from "../SectionForm";
import type { Text } from "@/lib/i18n/messages";

const ROLES: { key: string; label: Text; icon: IconType }[] = [
  { key: "info", label: "dashboard.ai.rulesSection.informationAgent", icon: IconInfoCircle },
  { key: "sales", label: "dashboard.ai.rulesSection.salesSpecialist", icon: IconTrendingUp },
  { key: "leads", label: "dashboard.ai.rulesSection.leadCollector", icon: IconUserPlus },
  { key: "booking", label: "dashboard.ai.rulesSection.appointmentBooking", icon: IconCalendarPlus },
  { key: "orders", label: "dashboard.ai.rulesSection.orderTaking", icon: IconShoppingCart },
  { key: "support", label: "dashboard.ai.rulesSection.supportAgent", icon: IconHeadset },
];

export function RulesSection({ config }: { config: AiConfig | null }) {
  const { t } = useLanguage();
  const roles = config?.roles ?? [];

  return (
    <SectionForm
      section="rules"
      icon={IconListCheck}
      title={"dashboard.ai.rulesSection.behaviourRules"}
    >
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
                defaultChecked={roles.includes(r.key)}
                className="peer sr-only"
              />
              <r.icon size={17} className="shrink-0" />
              <span className="flex-1">{t(r.label)}</span>
              <IconCheck size={15} className="hidden shrink-0 peer-checked:block" />
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <div className="mb-2 text-[13px] font-medium">
          <span className="text-muted">2.</span>{" "}
          {t("dashboard.ai.rulesSection.whenToHandOff")}
        </div>
        <textarea
          name="handoffRule"
          rows={3}
          defaultValue={config?.handoffRule ?? ""}
          placeholder={t("dashboard.ai.rulesSection.eGWhenThe")}
          className={AREA}
        />
      </div>

      <div>
        <div className="mb-2 text-[13px] font-medium">
          <span className="text-muted">3.</span>{" "}
          {t("dashboard.ai.rulesSection.howLongToWait")}
        </div>
        <div className="flex items-center gap-2">
          <input
            name="replyDelaySec"
            type="number"
            min={0}
            max={120}
            defaultValue={config?.replyDelaySec ?? 30}
            className="h-10 w-[90px] rounded-[8px] border border-input bg-soft px-3 text-[13px] outline-none focus:border-blue"
          />
          <span className="text-[13px] text-muted">{t("dashboard.ai.rulesSection.seconds")}</span>
        </div>
        <p className="mt-1.5 text-[12px] text-faint">
          {t("dashboard.ai.rulesSection.customersOftenSendSeveral")}
        </p>
      </div>

      <div className="grid gap-4 rounded-[10px] border border-border p-4">
        <div>
          <CheckRow
            name="leadEnabled"
            defaultChecked={config?.leadEnabled ?? false}
            label={
              <>
                <span className="text-muted">3.</span>{" "}
                {t("dashboard.ai.rulesSection.leadCapture")}
              </>
            }
          />
          <input
            name="leadRule"
            defaultValue={config?.leadRule ?? ""}
            placeholder={t("dashboard.ai.rulesSection.whatCountsAsA")}
            className="mt-2 h-10 w-full rounded-[8px] border border-input bg-canvas px-3 text-sm outline-none placeholder:text-faint focus:border-blue"
          />
        </div>

        <div>
          <CheckRow
            name="orderEnabled"
            defaultChecked={config?.orderEnabled ?? false}
            label={
              <>
                <span className="text-muted">4.</span>{" "}
                {t("dashboard.ai.rulesSection.orderCapture")}
              </>
            }
          />
          <input
            name="orderRule"
            defaultValue={config?.orderRule ?? ""}
            placeholder={t("dashboard.ai.rulesSection.whatCountsAsAn")}
            className="mt-2 h-10 w-full rounded-[8px] border border-input bg-canvas px-3 text-sm outline-none placeholder:text-faint focus:border-blue"
          />
        </div>

        <CheckRow
          name="allowOrderEdit"
          defaultChecked={config?.allowOrderEdit ?? false}
          label={
            <>
              <span className="text-muted">5.</span>{" "}
              {t("dashboard.ai.rulesSection.mayAmendCancelAn")}
            </>
          }
        />
      </div>

      <div>
        <div className="mb-2 text-[13px] font-medium">
          <span className="text-muted">6.</span>{" "}
          {t("dashboard.ai.rulesSection.frequentlyAskedQuestionsFaq")}
        </div>
        <textarea
          name="faqText"
          rows={3}
          defaultValue={config?.faqText ?? ""}
          placeholder={t("dashboard.ai.rulesSection.questionAnswer")}
          className={AREA}
        />
      </div>

      <AreaField
        name="policies"
        rows={3}
        label={"dashboard.ai.rulesSection.7DeliveryReturnsPolicy"}
        defaultValue={config?.policies}
      />
    </SectionForm>
  );
}

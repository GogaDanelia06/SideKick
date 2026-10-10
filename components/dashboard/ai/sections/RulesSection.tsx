"use client";

import type { AiConfig } from "@prisma/client";
import { IconListCheck } from "@tabler/icons-react";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { AREA, AreaField } from "../fields";
import { SectionForm } from "../SectionForm";
import { CaptureRules } from "./rules/CaptureRules";
import { RoleChoices } from "./rules/RoleChoices";
import { RuleHeading } from "./rules/RuleHeading";

export function RulesSection({ config }: { config: AiConfig | null }) {
  const { t } = useLanguage();

  return (
    <SectionForm section="rules" icon={IconListCheck} title="dashboard.ai.rulesSection.behaviourRules">
      <RoleChoices selected={config?.roles ?? []} />

      <div>
        <RuleHeading n="2." label="dashboard.ai.rulesSection.whenToHandOff" />
        <textarea
          name="handoffRule"
          rows={3}
          defaultValue={config?.handoffRule ?? ""}
          placeholder={t("dashboard.ai.rulesSection.eGWhenThe")}
          className={AREA}
        />
      </div>

      <div>
        <RuleHeading n="3." label="dashboard.ai.rulesSection.howLongToWait" />
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
        <p className="mt-1.5 text-[12px] text-faint">{t("dashboard.ai.rulesSection.customersOftenSendSeveral")}</p>
      </div>

      <CaptureRules config={config} />

      <div>
        <RuleHeading n="6." label="dashboard.ai.rulesSection.frequentlyAskedQuestionsFaq" />
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
        label="dashboard.ai.rulesSection.7DeliveryReturnsPolicy"
        defaultValue={config?.policies}
      />
    </SectionForm>
  );
}

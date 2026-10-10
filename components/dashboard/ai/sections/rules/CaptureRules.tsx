"use client";

import type { AiConfig } from "@prisma/client";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { CheckRow } from "../../fields";
import { Numbered } from "./RuleHeading";

const RULE_INPUT =
  "mt-2 h-10 w-full rounded-[8px] border border-input bg-canvas px-3 text-sm outline-none placeholder:text-faint focus:border-blue";

export function CaptureRules({ config }: { config: AiConfig | null }) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-4 rounded-[10px] border border-border p-4">
      <div>
        <CheckRow
          name="leadEnabled"
          defaultChecked={config?.leadEnabled ?? false}
          label={<Numbered n="3." label="dashboard.ai.rulesSection.leadCapture" />}
        />
        <input
          name="leadRule"
          defaultValue={config?.leadRule ?? ""}
          placeholder={t("dashboard.ai.rulesSection.whatCountsAsA")}
          className={RULE_INPUT}
        />
      </div>

      <div>
        <CheckRow
          name="orderEnabled"
          defaultChecked={config?.orderEnabled ?? false}
          label={<Numbered n="4." label="dashboard.ai.rulesSection.orderCapture" />}
        />
        <input
          name="orderRule"
          defaultValue={config?.orderRule ?? ""}
          placeholder={t("dashboard.ai.rulesSection.whatCountsAsAn")}
          className={RULE_INPUT}
        />
      </div>

      <CheckRow
        name="allowOrderEdit"
        defaultChecked={config?.allowOrderEdit ?? false}
        label={<Numbered n="5." label="dashboard.ai.rulesSection.mayAmendCancelAn" />}
      />
    </div>
  );
}

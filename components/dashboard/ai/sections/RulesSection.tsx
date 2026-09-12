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
import { saveAiRules } from "@/lib/dashboard/actions";
import { useLanguage } from "@/lib/i18n/useLanguage";
import type { Bilingual, IconType } from "@/lib/content/types";
import { AREA, AreaField, CheckRow, SectionForm } from "../parts";

const ROLES: { key: string; label: Bilingual; icon: IconType }[] = [
  { key: "info", label: { ka: "საინფორმაციო აგენტი", en: "Information agent" }, icon: IconInfoCircle },
  { key: "sales", label: { ka: "გაყიდვების სპეციალისტი", en: "Sales specialist" }, icon: IconTrendingUp },
  { key: "leads", label: { ka: "ლიდების შემგროვებელი", en: "Lead collector" }, icon: IconUserPlus },
  { key: "booking", label: { ka: "შეხვედრის დაჯავშნა", en: "Appointment booking" }, icon: IconCalendarPlus },
  { key: "orders", label: { ka: "შეკვეთის მიღება", en: "Order taking" }, icon: IconShoppingCart },
  { key: "support", label: { ka: "მხარდაჭერის აგენტი", en: "Support agent" }, icon: IconHeadset },
];

export function RulesSection({ config }: { config: AiConfig | null }) {
  const { t } = useLanguage();
  const roles = config?.roles ?? [];

  return (
    <SectionForm
      icon={IconListCheck}
      title={{ ka: "ქცევის წესები", en: "Behaviour rules" }}
      action={saveAiRules}
    >
      <fieldset>
        <legend className="mb-2 text-[13px] font-medium">
          <span className="text-muted">1.</span> {t({ ka: "როლები", en: "Roles" })}
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
          {t({ ka: "როდის გადასცეს საჭირო ადამიანს", en: "When to hand off to a person" })}
        </div>
        <textarea
          name="handoffRule"
          rows={3}
          defaultValue={config?.handoffRule ?? ""}
          placeholder={t({
            ka: "მაგ: როცა კლიენტი ითხოვს ოპერატორს ან საჩივარია…",
            en: "e.g. when the customer asks for a human, or it's a complaint…",
          })}
          className={AREA}
        />
      </div>

      <div>
        <div className="mb-2 text-[13px] font-medium">
          <span className="text-muted">3.</span>{" "}
          {t({ ka: "რამდენ ხანს დაელოდოს პასუხამდე", en: "How long to wait before replying" })}
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
          <span className="text-[13px] text-muted">{t({ ka: "წამი", en: "seconds" })}</span>
        </div>
        <p className="mt-1.5 text-[12px] text-faint">
          {t({
            ka: "კლიენტი ხშირად რამდენიმე მოკლე მესიჯს აგზავნის ზედიზედ. ლოდინი მათ ერთად კრებს და ერთ პასუხს აძლევს — 0 ნიშნავს მაშინვე პასუხს.",
            en: "Customers often send several short messages in a row. Waiting gathers them into one question and one answer — 0 replies immediately.",
          })}
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
                {t({ ka: "ლიდების შეგროვება", en: "Lead capture" })}
              </>
            }
          />
          <input
            name="leadRule"
            defaultValue={config?.leadRule ?? ""}
            placeholder={t({ ka: "რა აქტივობა ჩაითვლება ლიდად", en: "What counts as a lead" })}
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
                {t({ ka: "შეკვეთების შეგროვება", en: "Order capture" })}
              </>
            }
          />
          <input
            name="orderRule"
            defaultValue={config?.orderRule ?? ""}
            placeholder={t({ ka: "რა ნაბიჯი ჩაითვალოს შეკვეთად", en: "What counts as an order" })}
            className="mt-2 h-10 w-full rounded-[8px] border border-input bg-canvas px-3 text-sm outline-none placeholder:text-faint focus:border-blue"
          />
        </div>

        <CheckRow
          name="allowOrderEdit"
          defaultChecked={config?.allowOrderEdit ?? false}
          label={
            <>
              <span className="text-muted">5.</span>{" "}
              {t({
                ka: "შეკვეთის ჩასწორება / გაუქმების უფლება",
                en: "May amend / cancel an order",
              })}
            </>
          }
        />
      </div>

      <div>
        <div className="mb-2 text-[13px] font-medium">
          <span className="text-muted">6.</span>{" "}
          {t({ ka: "ხშირად დასმული კითხვები (FAQ)", en: "Frequently asked questions (FAQ)" })}
        </div>
        <textarea
          name="faqText"
          rows={3}
          defaultValue={config?.faqText ?? ""}
          placeholder={t({ ka: "კითხვა → პასუხი…", en: "question → answer…" })}
          className={AREA}
        />
      </div>

      <AreaField
        name="policies"
        rows={3}
        label={{
          ka: "7. მიწოდების / დაბრუნების წესები",
          en: "7. Delivery / returns policy",
        }}
        defaultValue={config?.policies}
      />
    </SectionForm>
  );
}

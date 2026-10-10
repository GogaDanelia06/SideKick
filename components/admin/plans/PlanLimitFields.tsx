"use client";

import type { Plan } from "@prisma/client";
import { PlanNumberField } from "./PlanNumberField";

export function PlanLimitFields({ plan }: { plan: Plan }) {
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-4">
      <PlanNumberField name="msgLimit" label="admin.plans.editor.messages" value={plan.msgLimit} />
      <PlanNumberField name="channelCap" label="admin.plans.editor.channels" value={plan.channelCap} />
      <PlanNumberField name="userCap" label="admin.plans.editor.users" value={plan.userCap} />
      <PlanNumberField name="productCap" label="admin.plans.editor.products" value={plan.productCap} />
    </div>
  );
}

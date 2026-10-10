import type { Text } from "@/lib/i18n/messages";

export const INPUT =
  "h-10 w-full rounded-[8px] border border-input bg-canvas px-3 text-sm outline-none placeholder:text-faint focus:border-blue";
export const LABEL = "mb-1 block text-[12px] font-medium text-muted";

export const ERRORS: Record<string, Text> = {
  name_required: "admin.plans.editor.nameIsRequired",
  bad_price: "admin.plans.editor.priceMustBeA",
  bad_cap: "admin.plans.editor.limitsMustBeNumbers",
};

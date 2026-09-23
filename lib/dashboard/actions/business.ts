"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { DASH } from "@/lib/dashboard/routes";
import { optionalField } from "@/lib/forms";
import type { ActionResult } from "./result";

export async function saveBusinessInfo(fd: FormData): Promise<ActionResult> {
  const ctx = await requirePermission("business:write");
  if (!ctx) return { ok: false, error: "forbidden" };
  const text = (name: string) => optionalField(fd, name);

  await prisma.business.update({
    where: { id: ctx.businessId },
    data: {
      name: text("name") ?? undefined,
      field: text("field"),
      email: text("email"),
      phone: text("phone"),
      contactInfo: text("contactInfo"),
      workingHours: text("workingHours"),
      site: text("site"),
      branches: text("branches"),
      description: text("description"),
      extra: text("extra"),
    },
  });
  revalidatePath(DASH.ai);
  revalidatePath(DASH.profile);
  return { ok: true };
}

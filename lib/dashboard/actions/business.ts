"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { can, requirePermission } from "@/lib/auth/permissions";
import { DASH } from "@/lib/dashboard/routes";
import { optionalField } from "@/lib/forms";
import { getContext } from "@/lib/session";

export async function saveBusinessInfo(fd: FormData) {
  const ctx = await requirePermission("business:write");
  if (!ctx) return;
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
}

export async function saveProfile(fd: FormData) {
  const ctx = await getContext();
  if (!ctx) return;
  const text = (name: string) => optionalField(fd, name);

  await prisma.user.update({
    where: { id: ctx.userId },
    data: { name: text("name"), phone: text("phone") },
  });

  if (can(ctx.role, "business:write")) {
    await prisma.business.update({
      where: { id: ctx.businessId },
      data: { name: text("company") ?? undefined, field: text("field"), description: text("description") },
    });
  }
  revalidatePath(DASH.profile);
}

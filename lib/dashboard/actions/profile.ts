"use server";

import { revalidatePath } from "next/cache";
import { can } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db";
import { BUSINESS_NAME_MAX, cleanBusinessName } from "@/lib/dashboard/businesses";
import { DASH } from "@/lib/dashboard/routes";
import { optionalField } from "@/lib/forms";
import { log } from "@/lib/logger";
import { getContext } from "@/lib/session";

export type ProfileError = "signed_out" | "name" | "taken" | "failed";
export type ProfileResult = { ok: true } | { ok: false; error: ProfileError };

/** Whether this person already has another business by this name — the switcher would show two alike. */
async function nameTaken(userId: string, businessId: string, name: string): Promise<boolean> {
  const twin = await prisma.membership.findFirst({
    where: {
      userId,
      businessId: { not: businessId },
      business: { name: { equals: name, mode: "insensitive" } },
    },
    select: { id: true },
  });
  return twin !== null;
}

/** The profile page's Save: this person's own details, and their business's when they may change it. */
export async function saveProfile(fd: FormData): Promise<ProfileResult> {
  const ctx = await getContext();
  if (!ctx) return { ok: false, error: "signed_out" };

  const text = (name: string) => optionalField(fd, name);
  const company = cleanBusinessName(text("company") ?? "");
  const mayRename = can(ctx.role, "business:write");
  if (mayRename && (!company || company.length > BUSINESS_NAME_MAX)) return { ok: false, error: "name" };

  try {
    if (mayRename && (await nameTaken(ctx.userId, ctx.businessId, company))) {
      return { ok: false, error: "taken" };
    }

    await prisma.user.update({
      where: { id: ctx.userId },
      data: { name: text("name"), phone: text("phone") },
    });

    if (mayRename) {
      await prisma.business.update({
        where: { id: ctx.businessId },
        data: { name: company, field: text("field"), description: text("description") },
      });
    }
  } catch (err) {
    log.error("could not save the profile", err, { userId: ctx.userId });
    return { ok: false, error: "failed" };
  }

  revalidatePath(DASH.profile);
  // The business name is on the AI page, in the sidebar and in the switcher as well.
  revalidatePath(DASH.ai);
  return { ok: true };
}

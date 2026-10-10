"use server";

import { revalidatePath } from "next/cache";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getContext } from "@/lib/session";
import { checkLimit } from "@/lib/billing/limits";
import { DASH } from "../routes";
import type { ActionResult } from "./result";
import { RANK, canManageTeam, isRole, rankOf } from "./teamRoles";

export async function addTeamMember(data: FormData): Promise<ActionResult> {
  const ctx = await getContext();
  if (!ctx) return { ok: false, error: "unauthorized" };
  if (!canManageTeam(ctx.role)) return { ok: false, error: "forbidden" };

  const email = String(data.get("email") ?? "").toLowerCase().trim();
  const name = String(data.get("name") ?? "").trim() || null;
  const wanted = String(data.get("role") ?? "VIEWER");
  if (!isRole(wanted)) return { ok: false, error: "bad_role" };
  if (RANK[wanted] > rankOf(ctx.role)) return { ok: false, error: "forbidden" };
  const role: Role = wanted;
  if (!email) return { ok: false, error: "email_required" };

  const found = await prisma.user.findUnique({ where: { email }, select: { id: true } });

  if (found) {
    const existing = await prisma.membership.findUnique({
      where: { userId_businessId: { userId: found.id, businessId: ctx.businessId } },
    });
    if (existing) return { ok: false, error: "already_member" };
  }

  const verdict = await checkLimit(ctx.businessId, "users");
  if (!verdict.allowed) return { ok: false, error: "plan_limit" };

  const userId =
    found?.id ??
    (
      await prisma.user.create({
        data: {
          email,
          name,
          emailVerified: new Date(),
        },
        select: { id: true },
      })
    ).id;

  await prisma.membership.create({
    data: { userId, businessId: ctx.businessId, role },
  });
  revalidatePath(DASH.team);
  return { ok: true };
}

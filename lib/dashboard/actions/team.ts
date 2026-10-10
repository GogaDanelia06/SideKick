"use server";

import { revalidatePath } from "next/cache";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getContext } from "@/lib/session";
import { DASH } from "../routes";
import type { ActionResult } from "./result";
import { RANK, canManageTeam, isRole, rankOf } from "./teamRoles";

export async function updateMemberRole(membershipId: string, role: Role): Promise<ActionResult> {
  const ctx = await getContext();
  if (!ctx) return { ok: false, error: "unauthorized" };
  if (!canManageTeam(ctx.role)) return { ok: false, error: "forbidden" };

  if (!isRole(role)) return { ok: false, error: "bad_role" };

  const target = await prisma.membership.findFirst({
    where: { id: membershipId, businessId: ctx.businessId },
  });
  if (!target) return { ok: false, error: "not_found" };

  const mine = rankOf(ctx.role);
  if (RANK[role] > mine) return { ok: false, error: "forbidden" };
  if (RANK[target.role] > mine) return { ok: false, error: "forbidden" };

  if (target.role === "OWNER" && role !== "OWNER") {
    const owners = await prisma.membership.count({
      where: { businessId: ctx.businessId, role: "OWNER" },
    });
    if (owners <= 1) return { ok: false, error: "last_owner" };
  }

  await prisma.membership.update({ where: { id: membershipId }, data: { role } });
  revalidatePath(DASH.team);
  return { ok: true };
}

export async function removeTeamMember(membershipId: string): Promise<ActionResult> {
  const ctx = await getContext();
  if (!ctx) return { ok: false, error: "unauthorized" };
  if (!canManageTeam(ctx.role)) return { ok: false, error: "forbidden" };

  const target = await prisma.membership.findFirst({
    where: { id: membershipId, businessId: ctx.businessId },
  });
  if (!target) return { ok: false, error: "not_found" };
  if (target.userId === ctx.userId) return { ok: false, error: "cannot_remove_self" };
  if (RANK[target.role] > rankOf(ctx.role)) return { ok: false, error: "forbidden" };

  if (target.role === "OWNER") {
    const owners = await prisma.membership.count({
      where: { businessId: ctx.businessId, role: "OWNER" },
    });
    if (owners <= 1) return { ok: false, error: "last_owner" };
  }

  await prisma.membership.delete({ where: { id: membershipId } });
  revalidatePath(DASH.team);
  return { ok: true };
}

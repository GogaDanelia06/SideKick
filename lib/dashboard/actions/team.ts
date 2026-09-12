"use server";

import type { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { can } from "@/lib/auth/permissions";
import { ROLE_RANK, isRole, rankOf } from "@/lib/auth/roles";
import { checkLimit } from "@/lib/billing/limits";
import { DASH } from "@/lib/dashboard/routes";
import { getContext, type Ctx } from "@/lib/session";
import type { ActionResult } from "./result";

/** The caller when they may manage the team, otherwise the refusal. */
async function teamManager(): Promise<Ctx | ActionResult> {
  const ctx = await getContext();
  if (!ctx) return { ok: false, error: "unauthorized" };
  return can(ctx.role, "team:manage") ? ctx : { ok: false, error: "forbidden" };
}

async function isLastOwner(businessId: string): Promise<boolean> {
  return (await prisma.membership.count({ where: { businessId, role: "OWNER" } })) <= 1;
}

export async function addTeamMember(fd: FormData): Promise<ActionResult> {
  const ctx = await teamManager();
  if ("ok" in ctx) return ctx;

  const email = String(fd.get("email") ?? "").toLowerCase().trim();
  const name = String(fd.get("name") ?? "").trim() || null;
  const role = String(fd.get("role") ?? "VIEWER");
  if (!isRole(role)) return { ok: false, error: "bad_role" };
  if (ROLE_RANK[role] > rankOf(ctx.role)) return { ok: false, error: "forbidden" };
  if (!email) return { ok: false, error: "email_required" };

  // Checked before any write, so a refused invite leaves no user row behind.
  const found = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (found) {
    const existing = await prisma.membership.findUnique({
      where: { userId_businessId: { userId: found.id, businessId: ctx.businessId } },
    });
    if (existing) return { ok: false, error: "already_member" };
  }

  const verdict = await checkLimit(ctx.businessId, "users");
  if (!verdict.allowed) return { ok: false, error: "plan_limit" };

  // Never rename an existing account: it may belong to other businesses too.
  const userId =
    found?.id ??
    (
      await prisma.user.create({
        // Invitees set a password through the emailed reset link, which proves the address.
        data: { email, name, emailVerified: new Date() },
        select: { id: true },
      })
    ).id;

  await prisma.membership.create({ data: { userId, businessId: ctx.businessId, role } });
  revalidatePath(DASH.team);
  return { ok: true };
}

export async function updateMemberRole(membershipId: string, role: Role): Promise<ActionResult> {
  const ctx = await teamManager();
  if ("ok" in ctx) return ctx;
  if (!isRole(role)) return { ok: false, error: "bad_role" };

  const target = await prisma.membership.findFirst({ where: { id: membershipId, businessId: ctx.businessId } });
  if (!target) return { ok: false, error: "not_found" };

  // Both the member's current role and the new role must be within the caller's rank.
  const mine = rankOf(ctx.role);
  if (ROLE_RANK[role] > mine || ROLE_RANK[target.role] > mine) return { ok: false, error: "forbidden" };
  if (target.role === "OWNER" && role !== "OWNER" && (await isLastOwner(ctx.businessId))) {
    return { ok: false, error: "last_owner" };
  }

  await prisma.membership.update({ where: { id: membershipId }, data: { role } });
  revalidatePath(DASH.team);
  return { ok: true };
}

export async function removeTeamMember(membershipId: string): Promise<ActionResult> {
  const ctx = await teamManager();
  if ("ok" in ctx) return ctx;

  const target = await prisma.membership.findFirst({ where: { id: membershipId, businessId: ctx.businessId } });
  if (!target) return { ok: false, error: "not_found" };
  if (target.userId === ctx.userId) return { ok: false, error: "cannot_remove_self" };
  if (ROLE_RANK[target.role] > rankOf(ctx.role)) return { ok: false, error: "forbidden" };
  if (target.role === "OWNER" && (await isLastOwner(ctx.businessId))) return { ok: false, error: "last_owner" };

  await prisma.membership.delete({ where: { id: membershipId } });
  revalidatePath(DASH.team);
  return { ok: true };
}

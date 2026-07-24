"use server";

import { revalidatePath } from "next/cache";
import type { LeadStatus, OrderStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getContext } from "@/lib/session";
import { can, requirePermission } from "@/lib/auth/permissions";
import { DASH } from "./routes";

/** Connect/disconnect a channel record (no real OAuth — that's the unbought module). */
export async function setChannelConnected(channelId: string, connected: boolean) {
  const ctx = await requirePermission("channels:write");
  if (!ctx) return;
  await prisma.channel.updateMany({
    where: { id: channelId, businessId: ctx.businessId },
    data: {
      connected,
      status: connected ? "ACTIVE" : "OFF",
      lastSyncAt: connected ? new Date() : null,
    },
  });
  revalidatePath(DASH.channels);
}

/** Move an order through its lifecycle. Scoped to the caller's business. */
export async function setOrderStatus(orderId: string, status: OrderStatus) {
  const ctx = await requirePermission("orders:write");
  if (!ctx) return;
  await prisma.order.updateMany({
    where: { id: orderId, businessId: ctx.businessId },
    data: { status },
  });
  revalidatePath(DASH.orders);
}

/* ── AI assistant settings ─────────────────────────────────────────────── */
// The assistant screen saves section by section, so one long form can't be lost
// by an unrelated validation error. Every write is scoped to the caller's
// business. These persist *settings only* — generating replies from them is the
// separate AI module.

/** Upsert a subset of AiConfig for the caller's business. */
async function upsertAiConfig(businessId: string, fields: Record<string, unknown>) {
  await prisma.aiConfig.upsert({
    where: { businessId },
    update: fields,
    create: { businessId, languages: ["ქართული"], ...fields },
  });
  revalidatePath(DASH.ai);
}

export async function saveAiCharacter(data: FormData) {
  const ctx = await requirePermission("ai:write");
  if (!ctx) return;
  await upsertAiConfig(ctx.businessId, {
    style: (data.get("style") as string) || null,
    length: (data.get("length") as string) || null,
    emoji: (data.get("emoji") as string) || null,
    addressForm: (data.get("addressForm") as string) || null,
    roles: data.getAll("roles").map(String),
  });
}

export async function saveAiRules(data: FormData) {
  const ctx = await requirePermission("ai:write");
  if (!ctx) return;
  await upsertAiConfig(ctx.businessId, {
    roles: data.getAll("roles").map(String),
    handoffRule: (data.get("handoffRule") as string) || null,
    leadEnabled: data.get("leadEnabled") === "on",
    leadRule: (data.get("leadRule") as string) || null,
    orderEnabled: data.get("orderEnabled") === "on",
    orderRule: (data.get("orderRule") as string) || null,
    allowOrderEdit: data.get("allowOrderEdit") === "on",
    faqText: (data.get("faqText") as string) || null,
    policies: (data.get("policies") as string) || null,
  });
}

export async function saveAiPrompt(data: FormData) {
  const ctx = await requirePermission("ai:write");
  if (!ctx) return;
  await upsertAiConfig(ctx.businessId, { prompt: (data.get("prompt") as string) || null });
}

export async function setAiLanguages(languages: string[]) {
  const ctx = await requirePermission("ai:write");
  if (!ctx) return;
  const clean = [...new Set(languages.map((l) => l.trim()).filter(Boolean))].slice(0, 12);
  await upsertAiConfig(ctx.businessId, { languages: clean });
}

/** Business profile shown to the assistant (and on the profile screen). */
export async function saveBusinessInfo(data: FormData) {
  const ctx = await requirePermission("business:write");
  if (!ctx) return;
  const s = (k: string) => ((data.get(k) as string) || "").trim() || null;
  await prisma.business.update({
    where: { id: ctx.businessId },
    data: {
      name: s("name") ?? undefined,
      field: s("field"),
      email: s("email"),
      phone: s("phone"),
      contactInfo: s("contactInfo"),
      workingHours: s("workingHours"),
      site: s("site"),
      branches: s("branches"),
      description: s("description"),
      extra: s("extra"),
    },
  });
  revalidatePath(DASH.ai);
  revalidatePath(DASH.profile);
}

const num = (data: FormData, k: string) => {
  const v = data.get(k);
  return v ? Number(v) : null;
};
const str = (data: FormData, k: string) => ((data.get(k) as string) || "").trim() || null;

export async function createProduct(data: FormData) {
  const ctx = await requirePermission("products:write");
  if (!ctx) return;
  const name = str(data, "name");
  const code = str(data, "code");
  if (!name || !code) return;
  await prisma.product.create({
    data: {
      businessId: ctx.businessId, name, code,
      price: num(data, "price") ?? 0, discountPct: num(data, "discountPct"), salePrice: num(data, "salePrice"),
      size: str(data, "size"), description: str(data, "description"), quantity: num(data, "quantity") ?? 0,
    },
  });
  revalidatePath(DASH.products);
}

export async function updateProduct(id: string, data: FormData) {
  const ctx = await requirePermission("products:write");
  if (!ctx) return;
  await prisma.product.updateMany({
    where: { id, businessId: ctx.businessId },
    data: {
      name: str(data, "name") ?? undefined, price: num(data, "price") ?? undefined,
      discountPct: num(data, "discountPct"), salePrice: num(data, "salePrice"),
      size: str(data, "size"), description: str(data, "description"), quantity: num(data, "quantity") ?? undefined,
    },
  });
  revalidatePath(DASH.products);
}

export async function deleteProduct(id: string) {
  const ctx = await requirePermission("products:write");
  if (!ctx) return;
  await prisma.product.deleteMany({ where: { id, businessId: ctx.businessId } });
  revalidatePath(DASH.products);
}

/**
 * The profile screen edits two different things at two different permission
 * levels: your own account (anyone may edit their own) and the business
 * (OWNER/ADMIN only). Applied separately so a VIEWER can still fix their own
 * name without being able to rename the company.
 */
export async function saveProfile(data: FormData) {
  const ctx = await getContext();
  if (!ctx) return;
  const s = (k: string) => (data.get(k) as string) || null;

  await prisma.user.update({
    where: { id: ctx.userId },
    data: { name: s("name"), phone: s("phone") },
  });

  if (can(ctx.role, "business:write")) {
    await prisma.business.update({
      where: { id: ctx.businessId },
      data: { name: s("company") ?? undefined, field: s("field"), description: s("description") },
    });
  }

  revalidatePath(DASH.profile);
}

/* ── Leads ─────────────────────────────────────────────────────────────── */
// Leads normally arrive from a conversation; these let an operator add and
// manage them by hand. All writes are scoped to the caller's business.

export async function createLead(data: FormData) {
  const ctx = await requirePermission("leads:write");
  if (!ctx) return;
  const name = str(data, "name");
  if (!name) return;
  await prisma.lead.create({
    data: {
      businessId: ctx.businessId,
      name,
      phone: str(data, "phone"),
      interest: str(data, "interest"),
      source: str(data, "source") ?? "manual",
      comment: str(data, "comment"),
    },
  });
  revalidatePath(DASH.leads);
}

export async function setLeadStatus(id: string, status: LeadStatus) {
  const ctx = await requirePermission("leads:write");
  if (!ctx) return;
  await prisma.lead.updateMany({ where: { id, businessId: ctx.businessId }, data: { status } });
  revalidatePath(DASH.leads);
}

export async function updateLeadComment(id: string, comment: string) {
  const ctx = await requirePermission("leads:write");
  if (!ctx) return;
  await prisma.lead.updateMany({
    where: { id, businessId: ctx.businessId },
    data: { comment: comment.trim() || null },
  });
  revalidatePath(DASH.leads);
}

export async function deleteLead(id: string) {
  const ctx = await requirePermission("leads:write");
  if (!ctx) return;
  await prisma.lead.deleteMany({ where: { id, businessId: ctx.businessId } });
  revalidatePath(DASH.leads);
}

/* ── Conversations ─────────────────────────────────────────────────────── */

/**
 * Turn the bot on/off for one thread. This is a stored setting the channel
 * integration will read before auto-replying — safe to change today even
 * though nothing is delivering messages yet.
 */
export async function setConversationAi(conversationId: string, aiEnabled: boolean) {
  const ctx = await requirePermission("conversations:write");
  if (!ctx) return;
  await prisma.conversation.updateMany({
    where: { id: conversationId, businessId: ctx.businessId },
    data: { aiEnabled },
  });
  revalidatePath(DASH.conversations);
}

/* ── Team ──────────────────────────────────────────────────────────────── */
// Only OWNER/ADMIN may change the team. Membership rows are the tenant link,
// so every lookup is filtered by the caller's businessId.

function canManageTeam(role: string) {
  return can(role, "team:manage");
}

export type TeamResult = { ok: true } | { ok: false; error: string };

/**
 * Add someone to the business. If the address already belongs to a user we
 * attach them; otherwise we create the account shell so they can be invited.
 * No password is set — they sign up / reset to claim it.
 */
export async function addTeamMember(data: FormData): Promise<TeamResult> {
  const ctx = await getContext();
  if (!ctx) return { ok: false, error: "unauthorized" };
  if (!canManageTeam(ctx.role)) return { ok: false, error: "forbidden" };

  const email = String(data.get("email") ?? "").toLowerCase().trim();
  const name = String(data.get("name") ?? "").trim() || null;
  const role = String(data.get("role") ?? "VIEWER") as Role;
  if (!email) return { ok: false, error: "email_required" };

  const user = await prisma.user.upsert({
    where: { email },
    update: name ? { name } : {},
    create: { email, name },
  });

  const existing = await prisma.membership.findUnique({
    where: { userId_businessId: { userId: user.id, businessId: ctx.businessId } },
  });
  if (existing) return { ok: false, error: "already_member" };

  await prisma.membership.create({
    data: { userId: user.id, businessId: ctx.businessId, role },
  });
  revalidatePath(DASH.team);
  return { ok: true };
}

export async function updateMemberRole(membershipId: string, role: Role): Promise<TeamResult> {
  const ctx = await getContext();
  if (!ctx) return { ok: false, error: "unauthorized" };
  if (!canManageTeam(ctx.role)) return { ok: false, error: "forbidden" };

  const target = await prisma.membership.findFirst({
    where: { id: membershipId, businessId: ctx.businessId },
  });
  if (!target) return { ok: false, error: "not_found" };

  // Never leave the business without an owner.
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

export async function removeTeamMember(membershipId: string): Promise<TeamResult> {
  const ctx = await getContext();
  if (!ctx) return { ok: false, error: "unauthorized" };
  if (!canManageTeam(ctx.role)) return { ok: false, error: "forbidden" };

  const target = await prisma.membership.findFirst({
    where: { id: membershipId, businessId: ctx.businessId },
  });
  if (!target) return { ok: false, error: "not_found" };
  if (target.userId === ctx.userId) return { ok: false, error: "cannot_remove_self" };

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

/* ── Billing ───────────────────────────────────────────────────────────── */

/**
 * Switch subscription plan. Records the change against the business; taking
 * payment for it is the PSP module, which isn't part of this build.
 */
export async function changePlan(planKey: string): Promise<TeamResult> {
  const ctx = await getContext();
  if (!ctx) return { ok: false, error: "unauthorized" };
  if (!can(ctx.role, "billing:manage")) return { ok: false, error: "forbidden" };

  const plan = await prisma.plan.findUnique({ where: { key: planKey } });
  if (!plan) return { ok: false, error: "unknown_plan" };

  await prisma.subscription.upsert({
    where: { businessId: ctx.businessId },
    update: { planId: plan.id },
    create: { businessId: ctx.businessId, planId: plan.id, status: "TRIAL" },
  });
  revalidatePath(DASH.billing);
  return { ok: true };
}

"use server";

import { revalidatePath } from "next/cache";
import type { LeadStatus, OrderStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getContext } from "@/lib/session";
import { can, requirePermission } from "@/lib/auth/permissions";
import { availableProviders, parseProvider } from "@/lib/payments";
import { isAllowedMonths, startCheckout } from "@/lib/billing/checkout";
import { checkLimit } from "@/lib/billing/limits";
import { log } from "@/lib/logger";
import { DASH } from "./routes";

export type ActionResult = { ok: true } | { ok: false; error: string };

export type TeamResult = ActionResult;

export async function setChannelConnected(channelId: string, connected: boolean) {
  const ctx = await requirePermission("channels:write");
  if (!ctx) return;

  // Only connecting is capped. Disconnecting must always work, or a tenant who
  // hits their ceiling could never get back under it.
  if (connected) {
    const verdict = await checkLimit(ctx.businessId, "channels");
    if (!verdict.allowed) return;
  }

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

export async function setOrderStatus(orderId: string, status: OrderStatus) {
  const ctx = await requirePermission("orders:write");
  if (!ctx) return;
  await prisma.order.updateMany({
    where: { id: orderId, businessId: ctx.businessId },
    data: { status },
  });
  revalidatePath(DASH.orders);
}

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

  const verdict = await checkLimit(ctx.businessId, "products");
  if (!verdict.allowed) return;

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

export async function setConversationAi(conversationId: string, aiEnabled: boolean) {
  const ctx = await requirePermission("conversations:write");
  if (!ctx) return;
  await prisma.conversation.updateMany({
    where: { id: conversationId, businessId: ctx.businessId },
    data: { aiEnabled },
  });
  revalidatePath(DASH.conversations);
}

function canManageTeam(role: string) {
  return can(role, "team:manage");
}

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

  // Checked after the duplicate test so re-inviting someone already on the team
  // reports the real reason rather than blaming the plan.
  const verdict = await checkLimit(ctx.businessId, "users");
  if (!verdict.allowed) return { ok: false, error: "plan_limit" };

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

export type CheckoutStart = { ok: true; redirectUrl: string } | { ok: false; error: string };

/**
 * Buying a plan.
 *
 * There is no path here that grants a plan without money changing hands — the
 * subscription only moves once a bank confirms the payment in
 * lib/billing/checkout.ts. The price is read from the plan row, never from the
 * form, so editing the page cannot change what is charged.
 */
export async function startPlanCheckout(
  planKey: string,
  months: number,
  provider: string,
  locale: "ka" | "en" = "ka",
): Promise<CheckoutStart> {
  const ctx = await getContext();
  if (!ctx) return { ok: false, error: "unauthorized" };
  if (!can(ctx.role, "billing:manage")) return { ok: false, error: "forbidden" };

  if (!isAllowedMonths(months)) return { ok: false, error: "bad_period" };

  const chosen = parseProvider(provider);
  if (!chosen) return { ok: false, error: "unknown_provider" };
  if (!availableProviders().includes(chosen)) return { ok: false, error: "provider_unavailable" };

  const plan = await prisma.plan.findUnique({ where: { key: planKey } });
  if (!plan) return { ok: false, error: "unknown_plan" };

  try {
    const started = await startCheckout({
      businessId: ctx.businessId,
      plan,
      months,
      provider: chosen,
      locale,
    });
    revalidatePath(DASH.billing);
    return { ok: true, redirectUrl: started.redirectUrl };
  } catch (err) {
    log.error("could not start plan checkout", err, { businessId: ctx.businessId, planKey });
    return { ok: false, error: "checkout_failed" };
  }
}

/**
 * Stops the subscription renewing. The paid period is not cut short — the
 * customer keeps what they paid for until `renewsAt`.
 */
export async function cancelSubscription(): Promise<TeamResult> {
  const ctx = await getContext();
  if (!ctx) return { ok: false, error: "unauthorized" };
  if (!can(ctx.role, "billing:manage")) return { ok: false, error: "forbidden" };

  const updated = await prisma.subscription.updateMany({
    where: { businessId: ctx.businessId },
    data: { status: "CANCELLED", cardRef: null },
  });
  if (updated.count === 0) return { ok: false, error: "no_subscription" };

  revalidatePath(DASH.billing);
  return { ok: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import type { LeadStatus, OrderStatus, Product, Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { fmtTime } from "./time";
import { getContext } from "@/lib/session";
import { can, requirePermission } from "@/lib/auth/permissions";
import { availableProviders, parseProvider } from "@/lib/payments";
import { isAllowedMonths, startCheckout } from "@/lib/billing/checkout";
import { checkLimit } from "@/lib/billing/limits";
import { deliverOutbound, type DeliveryStatus } from "@/lib/channels/send";
import { log } from "@/lib/logger";
import { DASH } from "./routes";

export type ActionResult = { ok: true } | { ok: false; error: string };

export type TeamResult = ActionResult;

export type ChannelToggleResult =
  | { ok: true }
  | { ok: false; error: "forbidden" }
  | { ok: false; error: "limit"; limit: number; used: number; planName: string };

/** Toggles a channel; says why when the plan's channel cap refuses. */
export async function setChannelConnected(
  channelId: string,
  connected: boolean,
): Promise<ChannelToggleResult> {
  const ctx = await requirePermission("channels:write");
  if (!ctx) return { ok: false, error: "forbidden" };

  // Only connecting is capped, so a business can always get back under its limit.
  if (connected) {
    const verdict = await checkLimit(ctx.businessId, "channels");
    if (!verdict.allowed) {
      return {
        ok: false,
        error: "limit",
        limit: verdict.limit,
        used: verdict.used,
        planName: verdict.planName,
      };
    }
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
  return { ok: true };
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
    // Clamped on the server: the value decides how long a function is held open.
    replyDelaySec: Math.min(120, Math.max(0, Number(data.get("replyDelaySec")) || 0)),
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

export type ProductResult =
  | { ok: true; product: Product }
  | { ok: false; error: "forbidden" | "missing" | "limit" | "duplicate" | "error" };

export async function createProduct(data: FormData): Promise<ProductResult> {
  const ctx = await requirePermission("products:write");
  if (!ctx) return { ok: false, error: "forbidden" };

  const name = str(data, "name");
  const code = str(data, "code");
  if (!name || !code) return { ok: false, error: "missing" };

  const verdict = await checkLimit(ctx.businessId, "products");
  if (!verdict.allowed) return { ok: false, error: "limit" };

  let product: Product;
  try {
    product = await prisma.product.create({
      data: {
        businessId: ctx.businessId, name, code,
        price: num(data, "price") ?? 0, discountPct: num(data, "discountPct"), salePrice: num(data, "salePrice"),
        size: str(data, "size"), description: str(data, "description"), quantity: num(data, "quantity") ?? 0,
      },
    });
  } catch (err) {
    // `[businessId, code]` is unique.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { ok: false, error: "duplicate" };
    }
    log.error("could not create a product", err, { businessId: ctx.businessId });
    return { ok: false, error: "error" };
  }

  // No revalidatePath: the client inserts the returned row without a re-render.
  return { ok: true, product };
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

/**
 * Role ranks: nobody may grant, change or remove a role above their own.
 * `ctx.role` comes from the membership row, not from the session token.
 */
const RANK: Record<Role, number> = { OWNER: 3, ADMIN: 2, OPERATOR: 1, VIEWER: 0 };

/** Server action arguments are untyped at runtime. */
function isRole(value: string): value is Role {
  return value in RANK;
}

const rankOf = (role: string) => (isRole(role) ? RANK[role] : -1);

export async function addTeamMember(data: FormData): Promise<TeamResult> {
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
        data: {
          email,
          name,
          // Invitees set a password through the emailed reset link, which proves the address.
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

export async function updateMemberRole(membershipId: string, role: Role): Promise<TeamResult> {
  const ctx = await getContext();
  if (!ctx) return { ok: false, error: "unauthorized" };
  if (!canManageTeam(ctx.role)) return { ok: false, error: "forbidden" };

  if (!isRole(role)) return { ok: false, error: "bad_role" };

  const target = await prisma.membership.findFirst({
    where: { id: membershipId, businessId: ctx.businessId },
  });
  if (!target) return { ok: false, error: "not_found" };

  // Both the member's current role and the new role must be within the caller's rank.
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

export async function removeTeamMember(membershipId: string): Promise<TeamResult> {
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

export type CheckoutStart = { ok: true; redirectUrl: string } | { ok: false; error: string };

/** Starts a bank checkout; the plan changes only after the bank confirms payment. */
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

/** Stops renewal; the paid period runs until `renewsAt`. */
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

export type ReplyResult =
  | {
      ok: true;
      delivery: DeliveryStatus | null;
      message: {
        id: string;
        sender: "OPERATOR";
        text: string;
        stoppedReason: null;
        timeLabel: string;
      };
    }
  | { ok: false; error: string };

/** Sends an operator's reply on the customer's channel: stored first, then delivered. */
export async function sendOperatorReply(
  conversationId: string,
  text: string,
): Promise<ReplyResult> {
  const ctx = await requirePermission("conversations:write");
  if (!ctx) return { ok: false, error: "forbidden" };

  const body = text.trim();
  if (!body) return { ok: false, error: "empty" };

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, businessId: ctx.businessId },
    select: { id: true },
  });
  if (!conversation) return { ok: false, error: "not_found" };

  const message = await prisma.message.create({
    data: { conversationId: conversation.id, sender: "OPERATOR", text: body },
    select: { id: true },
  });

  // Operator replies are not billed against the plan.
  await prisma.conversation.updateMany({
    where: { id: conversation.id, status: "NEW" },
    data: { status: "ACTIVE" },
  });

  const delivery = await deliverOutbound(conversation.id, message.id, body);

  revalidatePath(DASH.conversations);
  return {
    ok: true,
    delivery: delivery?.status ?? null,
    message: {
      id: message.id,
      sender: "OPERATOR" as const,
      text: body,
      stoppedReason: null,
      timeLabel: fmtTime.format(new Date()),
    },
  };
}

/** Creates a lead from a conversation; the unique `conversationId` prevents duplicates. */
export async function createLeadFromConversation(
  conversationId: string,
): Promise<ActionResult & { created?: boolean }> {
  const ctx = await requirePermission("leads:write");
  if (!ctx) return { ok: false, error: "forbidden" };

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, businessId: ctx.businessId },
    select: { id: true, customerName: true, channel: { select: { type: true } }, lead: { select: { id: true } } },
  });
  if (!conversation) return { ok: false, error: "not_found" };
  if (conversation.lead) return { ok: true, created: false };

  try {
    await prisma.lead.create({
      data: {
        businessId: ctx.businessId,
        conversationId: conversation.id,
        name: conversation.customerName?.trim() || null,
        source: conversation.channel?.type ?? "manual",
      },
    });
  } catch {
    // A concurrent double click created it first.
    return { ok: true, created: false };
  }

  revalidatePath(DASH.leads);
  revalidatePath(DASH.conversations);
  return { ok: true, created: true };
}

export type PlanSwitchResult = { ok: true } | { ok: false; error: string };

/**
 * Switches plans without payment, only while no bank provider is configured.
 * The subscription becomes TRIAL because nothing was paid.
 */
export async function switchPlanWithoutPayment(planKey: string): Promise<PlanSwitchResult> {
  const ctx = await requirePermission("billing:manage");
  if (!ctx) return { ok: false, error: "ამის უფლება არ გაქვს" };

  if (availableProviders().length > 0) {
    return { ok: false, error: "გადახდა ჩართულია — გეგმა ბანკის გავლით უნდა შეიცვალოს" };
  }

  const plan = await prisma.plan.findUnique({ where: { key: planKey }, select: { id: true } });
  if (!plan) return { ok: false, error: "გეგმა ვერ მოიძებნა" };

  await prisma.subscription.upsert({
    where: { businessId: ctx.businessId },
    // Reset usage, or a business that spent its old allowance would stay blocked.
    update: { planId: plan.id, status: "TRIAL", msgUsed: 0 },
    create: { businessId: ctx.businessId, planId: plan.id, status: "TRIAL", msgUsed: 0 },
  });

  log.info("plan switched with no payment configured", {
    businessId: ctx.businessId,
    plan: planKey,
  });

  revalidatePath(DASH.billing);
  return { ok: true };
}

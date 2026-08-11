"use server";

import { revalidatePath } from "next/cache";
import type { LeadStatus, OrderStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/db";
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

  // Looked up, never upserted.
  //
  // This used to create the account first and check the plan afterwards, so a
  // team that had hit its user cap got "plan_limit" *and* a leftover User row
  // with no membership — and because registration refuses an address that
  // already exists, that address could then never be signed up at all. A
  // refusal has to leave nothing behind.
  const found = await prisma.user.findUnique({ where: { email }, select: { id: true } });

  if (found) {
    const existing = await prisma.membership.findUnique({
      where: { userId_businessId: { userId: found.id, businessId: ctx.businessId } },
    });
    // Checked before the plan so re-inviting someone already on the team reports
    // the real reason rather than blaming the plan.
    if (existing) return { ok: false, error: "already_member" };
  }

  const verdict = await checkLimit(ctx.businessId, "users");
  if (!verdict.allowed) return { ok: false, error: "plan_limit" };

  // The name is deliberately not written for someone who already has an account.
  // `upsert`'s update branch used to set it, which let the owner of one business
  // rename a person who belongs to another — their own name, changed by a
  // stranger, with nothing in the interface to show it had happened.
  const userId =
    found?.id ??
    (
      await prisma.user.create({
        data: {
          email,
          name,
          // An invited colleague has no password, and the only way to get one is
          // the reset link — which goes to this address. So inbox control is
          // still proven before they can sign in, and the owner vouching for
          // them stands in for the confirmation step they never went through.
          //
          // Left null, `authorize()` throws UnverifiedEmail after they set a
          // password, and there is no resend route: the invitation was a
          // permanent lock-out with no way in.
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

export type ReplyResult =
  | {
      ok: true;
      delivery: DeliveryStatus | null;
      /** The stored reply, so the open thread can show it without refetching. */
      message: { id: string; sender: "OPERATOR"; text: string; stoppedReason: null };
    }
  | { ok: false; error: string };

/**
 * Sends a human's reply to a customer on the channel they wrote in on.
 *
 * This box sat disabled behind "replying requires the channel integration" for
 * as long as there was no way to reach the customer. There is now: the page
 * token is stored on the channel and `deliverOutbound` uses it, so a merchant
 * can answer someone from the same screen where the message arrived rather than
 * opening Facebook in another tab.
 *
 * The reply is recorded before it is sent. A message the customer received but
 * the inbox never shows is worse than the reverse — the merchant would answer
 * the same question twice, believing the first attempt had failed.
 */
export async function sendOperatorReply(
  conversationId: string,
  text: string,
): Promise<ReplyResult> {
  const ctx = await requirePermission("conversations:write");
  if (!ctx) return { ok: false, error: "forbidden" };

  const body = text.trim();
  if (!body) return { ok: false, error: "empty" };

  // Filtering by business as well as id is the point: an id from somewhere else
  // must not let anyone write into another tenant's conversation.
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, businessId: ctx.businessId },
    select: { id: true },
  });
  if (!conversation) return { ok: false, error: "not_found" };

  const message = await prisma.message.create({
    data: { conversationId: conversation.id, sender: "OPERATOR", text: body },
    select: { id: true },
  });

  // A person typing an answer is not the AI spending the plan's allowance, so
  // this is deliberately not counted against `msgLimit`.
  await prisma.conversation.updateMany({
    where: { id: conversation.id, status: "NEW" },
    data: { status: "ACTIVE" },
  });

  const delivery = await deliverOutbound(conversation.id, message.id, body);

  revalidatePath(DASH.conversations);
  return {
    ok: true,
    delivery: delivery?.status ?? null,
    message: { id: message.id, sender: "OPERATOR", text: body, stoppedReason: null },
  };
}

/**
 * Turns an open conversation into a lead.
 *
 * The mark in the chat header showed whether a lead existed and did nothing
 * when pressed, so the one moment a merchant is most likely to want one — while
 * reading what the customer just asked for — was the one place they could not
 * make one. It links back to the conversation, so the lead carries its own
 * evidence rather than a name typed from memory.
 *
 * `conversationId` is unique on `Lead`, which is what stops a second press
 * creating a duplicate; the existing one is returned instead.
 */
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
        // Facebook gives a page-scoped id, not a name, so this is often empty.
        // Left blank rather than filled with the id: a lead list of numbers is
        // worse than one a merchant knows to complete.
        name: conversation.customerName?.trim() || null,
        source: conversation.channel?.type ?? "manual",
      },
    });
  } catch {
    // The unique index on `conversationId` fired, which means a second press
    // arrived while this one was still working. The check above cannot prevent
    // that on its own — it only reads — so the constraint is what actually
    // holds, and this is where its verdict gets honoured. Without it a
    // double-click showed the merchant an error for a lead that was created.
    return { ok: true, created: false };
  }

  revalidatePath(DASH.leads);
  revalidatePath(DASH.conversations);
  return { ok: true, created: true };
}

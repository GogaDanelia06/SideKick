import type { PaymentProvider, Plan } from "@prisma/client";
import { prisma } from "@/lib/db";
import { adapterFor } from "@/lib/payments";
import { periodPrice } from "@/lib/content/packages";
import { log } from "@/lib/logger";
import { SITE } from "@/lib/seo/site";

/** The terms a customer may buy. Anything else is rejected before we ever
 *  talk to a bank, so a tampered form cannot invent a 0-month period. */
export const ALLOWED_MONTHS = [1, 3, 12] as const;
export type Months = (typeof ALLOWED_MONTHS)[number];

export function isAllowedMonths(value: number): value is Months {
  return (ALLOWED_MONTHS as readonly number[]).includes(value);
}

/**
 * Price is always recomputed here from the plan row — never taken from the
 * browser. A customer who edits the form still gets charged the real price.
 */
export function amountFor(plan: Plan, months: Months): number {
  return periodPrice(plan, months);
}

function baseUrl(): string {
  return (process.env.AUTH_URL ?? SITE.url).replace(/\/$/, "");
}

export type StartedCheckout = { paymentId: string; redirectUrl: string };

/**
 * Creates the payment record first, then asks the bank for a checkout session.
 *
 * Order matters: the row exists before the customer can possibly pay, so a
 * callback can never arrive for a payment we have no record of.
 */
export async function startCheckout(opts: {
  businessId: string;
  plan: Plan;
  months: Months;
  provider: PaymentProvider;
  locale: "ka" | "en";
}): Promise<StartedCheckout> {
  const { businessId, plan, months, provider, locale } = opts;
  const amount = amountFor(plan, months);

  const payment = await prisma.payment.create({
    data: {
      businessId,
      planId: plan.id,
      months,
      amount,
      provider,
      status: "PENDING",
      description: `${plan.name} — ${months} თვე`,
    },
  });

  try {
    const session = await adapterFor(provider).createCheckout({
      paymentId: payment.id,
      amount,
      currency: payment.currency,
      description: payment.description,
      returnUrl: `${baseUrl()}/dashboard/billing/return?payment=${payment.id}`,
      callbackUrl: `${baseUrl()}/api/payments/${provider.toLowerCase()}/callback`,
      saveCard: true,
      locale,
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { providerRef: session.providerRef },
    });

    return { paymentId: payment.id, redirectUrl: session.redirectUrl };
  } catch (err) {
    // The bank never got a usable order, so this attempt is dead. Marking it
    // keeps the customer's history honest instead of leaving a ghost PENDING.
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", failReason: "checkout_failed" },
    });
    log.error("checkout could not be started", err, { businessId, provider });
    throw err;
  }
}

/**
 * Reads the bank's authoritative status for a payment and applies it.
 *
 * Safe to call repeatedly — from the callback, from the return page, or from
 * both at once. Only a PENDING row is ever advanced, so a duplicate callback
 * cannot extend a subscription twice.
 */
export async function settlePayment(
  provider: PaymentProvider,
  providerRef: string,
): Promise<"paid" | "pending" | "failed" | "unknown"> {
  const payment = await prisma.payment.findUnique({
    where: { provider_providerRef: { provider, providerRef } },
  });

  if (!payment) {
    log.warn("callback for an unknown payment", { provider, providerRef });
    return "unknown";
  }
  if (payment.status !== "PENDING") {
    return payment.status === "PAID" ? "paid" : "failed";
  }

  const result = await adapterFor(provider).fetchStatus(providerRef);
  if (result.state === "pending") return "pending";

  if (result.state === "failed") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", failReason: result.reason?.slice(0, 200) ?? null },
    });
    return "failed";
  }

  await activate(payment.id, result.savedCardRef ?? null);
  return "paid";
}

/**
 * Marks the payment paid and moves the subscription onto the plan it bought.
 *
 * The whole thing is one transaction with a guard on `status: PENDING`: if two
 * callbacks race, exactly one updates a row and the other's update matches
 * nothing, so the period is only ever extended once.
 */
async function activate(paymentId: string, savedCardRef: string | null): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const claimed = await tx.payment.updateMany({
      where: { id: paymentId, status: "PENDING" },
      data: { status: "PAID", paidAt: new Date() },
    });
    if (claimed.count === 0) return;

    const payment = await tx.payment.findUniqueOrThrow({ where: { id: paymentId } });
    if (!payment.planId) return;

    const current = await tx.subscription.findUnique({
      where: { businessId: payment.businessId },
    });

    // Renewing early adds to whatever is left rather than throwing it away.
    const from =
      current?.renewsAt && current.renewsAt > new Date() ? current.renewsAt : new Date();
    const renewsAt = new Date(from);
    renewsAt.setMonth(renewsAt.getMonth() + payment.months);

    await tx.subscription.upsert({
      where: { businessId: payment.businessId },
      create: {
        businessId: payment.businessId,
        planId: payment.planId,
        status: "ACTIVE",
        renewsAt,
        cardRef: savedCardRef,
      },
      update: {
        planId: payment.planId,
        status: "ACTIVE",
        renewsAt,
        // A new period starts the message allowance over.
        msgUsed: 0,
        ...(savedCardRef ? { cardRef: savedCardRef } : {}),
      },
    });
  });

  log.info("subscription activated by payment", { paymentId });
}

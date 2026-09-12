import type { PaymentProvider, Plan } from "@prisma/client";
import { prisma } from "@/lib/db";
import { adapterFor } from "@/lib/payments";
import { periodPrice } from "@/lib/content/packages";
import { log } from "@/lib/logger";
import { SITE } from "@/lib/seo/site";

/** Billing terms a customer may buy; anything else is rejected before a bank is contacted. */
export const ALLOWED_MONTHS = [1, 3, 12] as const;
export type Months = (typeof ALLOWED_MONTHS)[number];

export function isAllowedMonths(value: number): value is Months {
  return (ALLOWED_MONTHS as readonly number[]).includes(value);
}

/** The price, always computed from the plan row and never taken from the form. */
export function amountFor(plan: Plan, months: Months): number {
  return periodPrice(plan, months);
}

function baseUrl(): string {
  return (process.env.AUTH_URL ?? SITE.url).replace(/\/$/, "");
}

export type StartedCheckout = { paymentId: string; redirectUrl: string };

/** Creates the payment row before opening the bank checkout, so every callback has a record. */
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
    // The bank never created an order, so this payment can never complete.
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", failReason: "checkout_failed" },
    });
    log.error("checkout could not be started", err, { businessId, provider });
    throw err;
  }
}

/** Applies the bank's status. Idempotent: only a PENDING payment advances. */
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

/** Marks the payment paid and applies the plan, in one transaction guarded on PENDING. */
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

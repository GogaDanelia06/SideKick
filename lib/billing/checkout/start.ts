import type { PaymentProvider, Plan } from "@prisma/client";
import { prisma } from "@/lib/db";
import { adapterFor } from "@/lib/payments";
import { log } from "@/lib/logger";
import { SITE } from "@/lib/seo/site";
import { amountFor, type Months } from "./periods";

function baseUrl(): string {
  return (process.env.AUTH_URL ?? SITE.url).replace(/\/$/, "");
}

export type StartedCheckout = { paymentId: string; redirectUrl: string };

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
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", failReason: "checkout_failed" },
    });
    log.error("checkout could not be started", err, { businessId, provider });
    throw err;
  }
}

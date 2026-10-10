import type { PaymentProvider } from "@prisma/client";
import { prisma } from "@/lib/db";
import { adapterFor } from "@/lib/payments";
import { log } from "@/lib/logger";

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
        msgUsed: 0,
        ...(savedCardRef ? { cardRef: savedCardRef } : {}),
      },
    });
  });

  log.info("subscription activated by payment", { paymentId });
}

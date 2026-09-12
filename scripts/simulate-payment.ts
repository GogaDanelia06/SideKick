/**
 * Runs a payment through the real settlement code with the bank HTTP calls stubbed.
 * Local databases only (see guard()).
 *
 *   pnpm tsx scripts/simulate-payment.ts <email> <planKey> [months] [BOG|TBC] [ok|fail]
 */
import { PrismaClient, type PaymentProvider } from "@prisma/client";

function guard() {
  const url = process.env.DATABASE_URL ?? "";
  const local = /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(url);
  if (!local || process.env.NODE_ENV === "production") {
    console.error(
      "refusing to run: this script fakes a bank confirmation and must never\n" +
        "touch a real database. It only runs against localhost.",
    );
    process.exit(1);
  }
}

function stubBank(outcome: "ok" | "fail") {
  const real = globalThis.fetch;
  globalThis.fetch = (async (url: unknown, init?: RequestInit) => {
    const u = String(url);

    // BOG: OAuth, then the receipt that reports the outcome.
    if (u.includes("oauth2.bog.ge")) {
      return Response.json({ access_token: "stub", expires_in: 3600 });
    }
    if (u.includes("api.bog.ge") && u.includes("/receipt/")) {
      return Response.json({
        order_status: { key: outcome === "ok" ? "completed" : "rejected" },
        reject_reason: outcome === "ok" ? null : "simulated failure",
      });
    }

    // TBC: token, then the payment record.
    if (u.includes("/tpay/access-token")) {
      return Response.json({ access_token: "stub", expires_in: 3600 });
    }
    if (u.includes("/tpay/payments/")) {
      return Response.json({
        status: outcome === "ok" ? "Succeeded" : "Failed",
        recId: outcome === "ok" ? "stub-saved-card" : null,
        userMessage: outcome === "ok" ? null : "simulated failure",
      });
    }

    return real(url as string, init);
  }) as typeof fetch;
}

async function main() {
  guard();

  const [email, planKey, monthsArg = "1", providerArg = "BOG", outcomeArg = "ok"] =
    process.argv.slice(2);

  if (!email || !planKey) {
    console.error(
      "usage: pnpm tsx scripts/simulate-payment.ts <email> <planKey> [months] [BOG|TBC] [ok|fail]",
    );
    process.exit(1);
  }

  const months = Number(monthsArg);
  const provider = providerArg.toUpperCase() as PaymentProvider;
  const outcome = outcomeArg === "fail" ? "fail" : "ok";

  stubBank(outcome);
  const { settlePayment, amountFor, isAllowedMonths } = await import("../lib/billing/checkout");
  if (!isAllowedMonths(months)) {
    console.error(`months must be 1, 3 or 12 — got ${monthsArg}`);
    process.exit(1);
  }

  const prisma = new PrismaClient();

  const user = await prisma.user.findUnique({
    where: { email },
    include: { memberships: true },
  });
  const businessId = user?.memberships[0]?.businessId;
  if (!businessId) {
    console.error(`no business found for ${email}`);
    process.exit(1);
  }

  const plan = await prisma.plan.findUnique({ where: { key: planKey } });
  if (!plan) {
    const keys = (await prisma.plan.findMany()).map((p) => p.key).join(", ");
    console.error(`unknown plan "${planKey}". Available: ${keys}`);
    process.exit(1);
  }

  const amount = amountFor(plan, months);
  const providerRef = `sim-${Date.now()}`;

  await prisma.payment.create({
    data: {
      businessId,
      planId: plan.id,
      months,
      amount,
      provider,
      providerRef,
      status: "PENDING",
      description: `${plan.name} — ${months} თვე (სიმულაცია)`,
    },
  });

  console.log(`created a PENDING payment: ${amount}₾, ${months} month(s), ${provider}`);
  console.log(`settled as: ${await settlePayment(provider, providerRef)}`);

  // Second call proves a replayed callback changes nothing.
  console.log(`settled again (replay): ${await settlePayment(provider, providerRef)}`);

  const sub = await prisma.subscription.findUnique({
    where: { businessId },
    include: { plan: true },
  });
  console.log(
    `subscription: ${sub?.status} · ${sub?.plan.name} · renews ${
      sub?.renewsAt?.toISOString().slice(0, 10) ?? "—"
    }`,
  );
  console.log("open /dashboard/billing to see it.");

  await prisma.$disconnect();
}

void main();

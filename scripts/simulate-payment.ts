import { PrismaClient, type PaymentProvider } from "@prisma/client";
import { guard, stubBank } from "./support/bankStub";

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

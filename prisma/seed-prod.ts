import { PrismaClient } from "@prisma/client";
import { PLANS } from "./seed-data";

/**
 * PRODUCTION seed — reference data only.
 *
 * Loads the subscription plans, which the app genuinely needs (registration
 * attaches a plan, billing reads it, the pricing page lists them). It creates
 * NO demo tenant, users, products, orders or conversations — a customer-facing
 * database must start empty of fake business data.
 *
 * Safe to re-run: every write is an upsert keyed on the plan key.
 *
 *   pnpm db:seed:prod
 */
const prisma = new PrismaClient();

async function main() {
  for (const plan of PLANS) {
    await prisma.plan.upsert({ where: { key: plan.key }, create: plan, update: plan });
  }

  const total = await prisma.plan.count();
  console.log(`✓ Production seed complete — ${total} plans available.`);
  console.log(`  ${PLANS.map((p) => `${p.name} (${p.price}₾)`).join(", ")}`);
  console.log("  No demo tenant created. The database is ready for real clients.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

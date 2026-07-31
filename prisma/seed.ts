import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PLANS, SITE_STATS, PRODUCTS, CHANNELS, LEADS, ORDERS, FAQS, AI_CONFIG, TEAM_MEMBERS, PAYMENTS } from "./seed-data";

const prisma = new PrismaClient();
const BIZ = "biz_demo";
const USER = "usr_demo";

function assertLocalDatabase() {
  const url = process.env.DATABASE_URL ?? "";
  const isLocal = /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(url);
  if (isLocal || process.argv.includes("--force")) return;

  const host = (() => {
    try {
      return new URL(url).host;
    } catch {
      return "(unparseable DATABASE_URL)";
    }
  })();

  console.error(
    `\n✗ Refusing to seed DEMO data into a non-local database.\n` +
      `  Target: ${host}\n\n` +
      `  This seed creates a fake business, fake products/orders and a\n` +
      `  demo@sidekick.ge / demo1234 login — none of which belong in production.\n\n` +
      `  For a real database run:  pnpm db:seed:prod\n` +
      `  To override anyway:       pnpm db:seed -- --force\n`,
  );
  process.exit(1);
}

async function main() {
  assertLocalDatabase();

  for (const p of PLANS) await prisma.plan.upsert({ where: { key: p.key }, create: p, update: p });
  for (const s of SITE_STATS) await prisma.siteStat.upsert({ where: { key: s.key }, create: s, update: s });

  const passwordHash = await bcrypt.hash("demo1234", 10);
  await prisma.user.upsert({
    where: { email: "demo@sidekick.ge" },
    update: { name: "Mariam K." },
    create: { id: USER, email: "demo@sidekick.ge", name: "Mariam K.", passwordHash, phone: "+995 599 00 00 00", emailVerified: new Date() },
  });
  await prisma.business.upsert({
    where: { id: BIZ },
    update: {},
    create: { id: BIZ, name: "დემო ბიზნესი", field: "ელ-კომერცია", description: "სადემონსტრაციო მაღაზია." },
  });
  await prisma.membership.upsert({
    where: { userId_businessId: { userId: USER, businessId: BIZ } },
    update: {},
    create: { userId: USER, businessId: BIZ, role: "OWNER" },
  });
  const standard = await prisma.plan.findUniqueOrThrow({ where: { key: "standard" } });
  await prisma.subscription.upsert({
    where: { businessId: BIZ },
    update: { msgUsed: 3580, cardRef: "4242" },
    create: { businessId: BIZ, planId: standard.id, status: "ACTIVE", msgUsed: 3580, cardRef: "4242" },
  });
  await prisma.aiConfig.upsert({ where: { businessId: BIZ }, update: AI_CONFIG, create: { businessId: BIZ, ...AI_CONFIG } });

  for (const m of TEAM_MEMBERS) {
    const u = await prisma.user.upsert({
      where: { email: m.email },
      update: { name: m.name },
      create: { email: m.email, name: m.name, emailVerified: new Date() },
    });
    await prisma.membership.upsert({
      where: { userId_businessId: { userId: u.id, businessId: BIZ } },
      update: { role: m.role },
      create: { userId: u.id, businessId: BIZ, role: m.role },
    });
  }

  await prisma.$transaction([
    prisma.payment.deleteMany({ where: { businessId: BIZ } }),
    prisma.orderItem.deleteMany({ where: { order: { businessId: BIZ } } }),
    prisma.order.deleteMany({ where: { businessId: BIZ } }),
    prisma.message.deleteMany({ where: { conversation: { businessId: BIZ } } }),
    prisma.conversation.deleteMany({ where: { businessId: BIZ } }),
    prisma.lead.deleteMany({ where: { businessId: BIZ } }),
    prisma.product.deleteMany({ where: { businessId: BIZ } }),
    prisma.channel.deleteMany({ where: { businessId: BIZ } }),
    prisma.faq.deleteMany({ where: { businessId: BIZ } }),
  ]);

  await prisma.product.createMany({ data: PRODUCTS.map((p) => ({ ...p, businessId: BIZ })) });
  await prisma.channel.createMany({ data: CHANNELS.map((c) => ({ ...c, businessId: BIZ, lastSyncAt: c.connected ? new Date() : null })) });
  await prisma.faq.createMany({ data: FAQS.map((f) => ({ ...f, businessId: BIZ })) });
  await prisma.lead.createMany({ data: LEADS.map((l) => ({ ...l, businessId: BIZ })) });
  await prisma.payment.createMany({ data: PAYMENTS.map((p) => ({ ...p, date: new Date(p.date), businessId: BIZ })) });

  for (const o of ORDERS) {
    const total = o.items.reduce((sum, i) => sum + i.qty * i.price, 0);
    await prisma.order.create({
      data: {
        businessId: BIZ, customerName: o.customerName, phone: o.phone, address: o.address, status: o.status, total,
        items: { create: o.items.map((i) => ({ codeSnapshot: i.code, nameSnapshot: i.name, qty: i.qty, price: i.price, lineTotal: i.qty * i.price })) },
      },
    });
  }
  console.log("✓ Seed complete — demo@sidekick.ge / demo1234");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

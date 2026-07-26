import { PrismaClient } from "@prisma/client";
import { PLANS } from "./seed-data";
import { FAQS } from "../lib/content/faq";

const prisma = new PrismaClient();

async function main() {
  for (const plan of PLANS) {
    await prisma.plan.upsert({ where: { key: plan.key }, create: plan, update: plan });
  }

  if ((await prisma.siteFaq.count()) === 0) {
    await prisma.siteFaq.createMany({
      data: FAQS.map((f, i) => ({
        questionKa: f.question.ka,
        questionEn: f.question.en,
        answerKa: f.answer.ka,
        answerEn: f.answer.en,
        order: i,
        published: true,
      })),
    });
  }

  const total = await prisma.plan.count();
  const faq = await prisma.siteFaq.count();
  console.log(`✓ Production seed complete — ${total} plans, ${faq} FAQ entries.`);
  console.log(`  ${PLANS.map((p) => `${p.name} (${p.price}₾)`).join(", ")}`);
  console.log("  No demo tenant created. SiteStat left empty (no invented numbers).");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

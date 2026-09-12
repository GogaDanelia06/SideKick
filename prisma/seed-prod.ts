import { PrismaClient } from "@prisma/client";
import { PLANS } from "./seed-data";
import { FAQS } from "../lib/content/faq";
import { TERMS, PRIVACY, DATA_PROTECTION } from "../lib/content/legal";
import { BENEFITS } from "../lib/content/benefits";
import { SERVICES } from "../lib/content/services";
import { ICONS } from "../lib/content/icons";

/** Map a shipped icon component back to the name stored in the database. */
function iconName(icon: unknown): string {
  const hit = Object.entries(ICONS).find(([, c]) => c === icon);
  return hit?.[0] ?? "IconSparkles";
}

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

  // Import drafted legal sections only into empty documents, so edits are never overwritten.
  for (const { doc, src } of [
    { doc: "terms", src: TERMS },
    { doc: "privacy", src: PRIVACY },
    { doc: "data-protection", src: DATA_PROTECTION },
  ]) {
    if ((await prisma.legalSection.count({ where: { doc } })) > 0) continue;
    await prisma.legalSection.createMany({
      data: src.sections.map((s, i) => ({
        doc,
        order: i,
        headingKa: s.heading.ka,
        headingEn: s.heading.en,
        bodyKa: (s.paragraphs ?? []).map((p) => p.ka).join("\n\n"),
        bodyEn: (s.paragraphs ?? []).map((p) => p.en).join("\n\n"),
        bulletsKa: (s.bullets ?? []).map((b) => b.ka).join("\n"),
        bulletsEn: (s.bullets ?? []).map((b) => b.en).join("\n"),
      })),
    });
  }

  // Import the shipped benefit and service boxes into empty tables.
  if ((await prisma.benefit.count()) === 0) {
    await prisma.benefit.createMany({
      data: BENEFITS.map((b, i) => ({
        order: i,
        icon: iconName(b.icon),
        titleKa: b.title.ka,
        titleEn: b.title.en,
        descKa: b.desc.ka,
        descEn: b.desc.en,
      })),
    });
  }

  if ((await prisma.serviceBox.count()) === 0) {
    await prisma.serviceBox.createMany({
      data: SERVICES.map((s, i) => ({
        order: i,
        icon: iconName(s.icon),
        titleKa: s.title.ka,
        titleEn: s.title.en,
        bodyKa: s.desc.ka,
        bodyEn: s.desc.en,
      })),
    });
  }

  const total = await prisma.plan.count();
  const faq = await prisma.siteFaq.count();
  const legal = await prisma.legalSection.count();
  const boxes = (await prisma.benefit.count()) + (await prisma.serviceBox.count());
  console.log(
    `✓ Production seed complete — ${total} plans, ${faq} FAQ, ${legal} legal sections, ${boxes} boxes.`,
  );
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

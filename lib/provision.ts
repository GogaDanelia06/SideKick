import { prisma } from "@/lib/db";
import type { ChannelType, Prisma } from "@prisma/client";
import { AI_DEFAULTS } from "@/lib/ai/settings";
import { DEFAULT_AI_LANGUAGE } from "@/lib/dashboard/aiLanguages";

const CHANNELS: ChannelType[] = ["FACEBOOK", "INSTAGRAM", "WHATSAPP", "WEBSITE"];

export async function provisionBusiness(
  userId: string,
  name: string,
  field?: string,
  db: Prisma.TransactionClient | typeof prisma = prisma,
) {
  const plan = await db.plan.findUnique({ where: { key: "basic" } });
  return db.business.create({
    data: {
      name,
      field,
      memberships: { create: { userId, role: "OWNER" } },
      aiConfig: {
        create: { ...AI_DEFAULTS, languages: [DEFAULT_AI_LANGUAGE], roles: ["info", "sales", "support"] },
      },
      channels: { create: CHANNELS.map((type) => ({ type })) },
      ...(plan ? { subscription: { create: { planId: plan.id, status: "TRIAL" } } } : {}),
    },
  });
}

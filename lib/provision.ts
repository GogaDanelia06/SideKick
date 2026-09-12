import { prisma } from "@/lib/db";
import type { ChannelType, Prisma } from "@prisma/client";

const CHANNELS: ChannelType[] = ["FACEBOOK", "INSTAGRAM", "WHATSAPP", "WEBSITE"];

/** Creates a user's business with its defaults; takes a transaction client so registration stays atomic. */
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
        create: {
          languages: ["ქართული"],
          style: "პროფესიონალური",
          length: "საშუალო",
          emoji: "ზომიერად",
          addressForm: "ფორმალური",
          roles: ["info", "sales", "support"],
        },
      },
      channels: { create: CHANNELS.map((type) => ({ type })) },
      ...(plan ? { subscription: { create: { planId: plan.id, status: "TRIAL" } } } : {}),
    },
  });
}

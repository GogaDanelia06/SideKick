import { prisma } from "@/lib/db";
import type { ChannelType } from "@prisma/client";

const CHANNELS: ChannelType[] = ["FACEBOOK", "INSTAGRAM", "WHATSAPP", "WEBSITE"];

export async function provisionBusiness(userId: string, name: string, field?: string) {
  const plan = await prisma.plan.findUnique({ where: { key: "basic" } });
  return prisma.business.create({
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

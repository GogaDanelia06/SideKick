import { prisma } from "@/lib/db";
import type { ChannelType, Prisma } from "@prisma/client";

const CHANNELS: ChannelType[] = ["FACEBOOK", "INSTAGRAM", "WHATSAPP", "WEBSITE"];

/**
 * Gives a user a business of their own, with everything a business needs.
 *
 * Takes a client so the caller can run it inside a transaction. Registration
 * must: it creates the user and then calls this, and when the two were separate
 * writes a failure here left an account that could sign in and belonged nowhere
 * — every dashboard route bouncing it back to the login screen, and the address
 * already taken so it could not register again. A locked-out account with no
 * error message to go on.
 */
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

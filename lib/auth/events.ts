import type { NextAuthConfig } from "next-auth";
import { prisma } from "@/lib/db";
import { provisionBusiness } from "@/lib/provision";
import { log } from "@/lib/logger";

export const authEvents: NextAuthConfig["events"] = {
  async createUser({ user }) {
    if (!user.id) return;

    try {
      const existing = await prisma.membership.findFirst({
        where: { userId: user.id },
        select: { id: true },
      });
      if (existing) return;

      const person = user.name?.trim() || user.email?.split("@")[0] || "New";
      await provisionBusiness(user.id, `${person}'s business`);

      log.info("provisioned a business for a new OAuth account", { userId: user.id });
    } catch (err) {
      log.error("could not provision a business for a new OAuth account", err, { userId: user.id });
    }
  },

  async linkAccount({ user, account }) {
    if (account.provider !== "google" || !user.id) return;
    try {
      await prisma.user.updateMany({
        where: { id: user.id, emailVerified: null },
        data: { emailVerified: new Date() },
      });
    } catch (err) {
      log.error("could not mark a Google-linked email as confirmed", err, { userId: user.id });
    }
  },
};

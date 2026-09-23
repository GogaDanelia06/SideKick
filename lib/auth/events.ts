import type { NextAuthConfig } from "next-auth";
import { prisma } from "@/lib/db";
import { provisionBusiness } from "@/lib/provision";
import { log } from "@/lib/logger";

/** What Auth.js does on its own after a sign-in, once the account itself is settled. */
export const authEvents: NextAuthConfig["events"] = {
  /** Provisions a business for a new Google account (email signups get one at registration). */
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
      // Sign-in still succeeds; scripts/find-orphan-users.ts --fix repairs the account.
      log.error("could not provision a business for a new OAuth account", err, { userId: user.id });
    }
  },

  /** Google has just proven the address belongs to this person, so it counts as confirmed. */
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

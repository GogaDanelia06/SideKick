import NextAuth, { CredentialsSignin } from "next-auth";
import type { Provider } from "next-auth/providers";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { clear, clientIp, consume } from "@/lib/security/rateLimit";
import { authConfig } from "./auth.config";
import { googleSignInEnabled } from "@/lib/auth/providers";
import { provisionBusiness } from "@/lib/provision";
import { log } from "@/lib/logger";

export class RateLimitedSignin extends CredentialsSignin {
  code = "rate_limited";
}

/** The password was right, but the address has never been confirmed. */
export class UnverifiedEmail extends CredentialsSignin {
  code = "unverified_email";
}

const providers: Provider[] = [
  Credentials({
    credentials: { email: {}, password: {}, remember: {} },
    async authorize(creds, request) {
      const email = String(creds?.email ?? "").toLowerCase().trim();
      const password = String(creds?.password ?? "");
      if (!email || !password) return null;

      const ip = clientIp(request);
      const [byEmail, byIp] = await Promise.all([
        consume("login", email),
        consume("loginIp", ip),
      ]);
      if (!byEmail.ok || !byIp.ok) throw new RateLimitedSignin();

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.passwordHash) return null;
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return null;

      // Checked after the password, so it never reveals whether an address is registered.
      if (!user.emailVerified) throw new UnverifiedEmail();

      await Promise.all([clear("login", email), clear("loginIp", ip)]);
      // Only an explicit "1" means remember me; anything else gets the shorter session.
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        remember: String(creds?.remember ?? "") === "1",
      };
    },
  }),
];

// Registered only when fully configured (the same check the login page uses).
if (googleSignInEnabled()) providers.push(Google);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers,
  events: {
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
        log.error("could not provision a business for a new OAuth account", err, {
          userId: user.id,
        });
      }
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user?.id) {
        token.uid = user.id;

        // Stamped once at sign-in (see lib/auth/sessionExpiry.ts). OAuth sign-ins are never remembered.
        token.remember = user.remember === true;
        token.startedAt = Date.now();
        const [m, account] = await Promise.all([
          prisma.membership.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: "asc" },
          }),
          prisma.user.findUnique({ where: { id: user.id }, select: { isAdmin: true } }),
        ]);
        if (m) {
          token.businessId = m.businessId;
          token.role = m.role;
        }
        token.isAdmin = account?.isAdmin ?? false;
      }
      return token;
    },
  },
});

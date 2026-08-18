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

      // Checked only after the password, so the answer never reveals whether an
      // address is registered to someone who does not know its password.
      if (!user.emailVerified) throw new UnverifiedEmail();

      await Promise.all([clear("login", email), clear("loginIp", ip)]);
      // The form sends the "remember me" choice as a string, like every other
      // credential field. Anything other than an explicit yes is a no, so a
      // request that omits it gets the shorter session rather than the longer
      // one — the safe direction for a field a caller controls.
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        remember: String(creds?.remember ?? "") === "1",
      };
    },
  }),
];

// Same predicate the login and register pages use to decide whether to show the
// button. Registering the provider on an id alone would leave a button that
// leads to a Google error page, and half-configured is worse than off.
if (googleSignInEnabled()) providers.push(Google);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers,
  events: {
    /**
     * Gives a brand-new Google account a business of its own.
     *
     * Signing up with email and password goes through /api/auth/register, which
     * provisions one. Google does not: the adapter creates the `User` row and
     * nothing else, so without this the account can sign in and belongs
     * nowhere — `getContext` finds no membership and bounces it off every
     * dashboard route, back to the login screen it just came from, with no
     * error to explain it. A door with no room behind it.
     *
     * Fires once, when the adapter creates the user, so it cannot double-run for
     * somebody signing in again. The membership check is belt and braces: an
     * adapter that ever retries would otherwise hand one person two businesses.
     */
    async createUser({ user }) {
      if (!user.id) return;

      try {
        const existing = await prisma.membership.findFirst({
          where: { userId: user.id },
          select: { id: true },
        });
        if (existing) return;

        // Google gives a display name and not much else, so the business is
        // named after the person and the owner renames it later. Falling back to
        // the local part of the address keeps it from reading "'s business".
        const person = user.name?.trim() || user.email?.split("@")[0] || "New";
        await provisionBusiness(user.id, `${person}'s business`);

        log.info("provisioned a business for a new OAuth account", { userId: user.id });
      } catch (err) {
        // Loudly, and without failing the sign-in: the account exists either
        // way, and refusing to let them in would leave the same locked-out row
        // with a worse first impression. `scripts/find-orphan-users.ts --fix`
        // repairs anything that lands here.
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

        // Stamped once, at sign-in, and never refreshed — see
        // lib/auth/sessionExpiry.ts for why a sliding stamp would undo the
        // session cookie. Google has no `authorize()` to carry the choice, so
        // an OAuth sign-in is treated as not remembered, which is also what
        // closes the gap where that button ignored the box entirely.
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

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

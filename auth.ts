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
import { googleSignInAllowed } from "@/lib/auth/googleSignIn";
import { authEvents } from "@/lib/auth/events";
import { stampSignIn, switchTokenBusiness } from "@/lib/auth/token";

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
// Google confirms email ownership, so a Google sign-in may attach to an existing account
// with the same address; `signIn` below (lib/auth/googleSignIn.ts) decides what is allowed.
// `select_account` makes Google ask which account every time, rather than quietly reusing
// whichever one the browser is signed in to — which matters once several are in play.
if (googleSignInEnabled()) {
  providers.push(
    Google({
      allowDangerousEmailAccountLinking: true,
      authorization: { params: { prompt: "select_account" } },
    }),
  );
}

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers,
  events: authEvents,
  callbacks: {
    ...authConfig.callbacks,
    signIn: googleSignInAllowed,
    async jwt({ token, user, trigger, session }) {
      if (user?.id) return stampSignIn(token, { id: user.id, remember: user.remember });
      // `unstable_update` from the business switcher; the membership is checked in there.
      if (trigger === "update") return switchTokenBusiness(token, session?.user?.businessId);
      return token;
    },
  },
});

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

      if (!user.emailVerified) throw new UnverifiedEmail();

      await Promise.all([clear("login", email), clear("loginIp", ip)]);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        remember: String(creds?.remember ?? "") === "1",
      };
    },
  }),
];

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
      if (trigger === "update") return switchTokenBusiness(token, session?.user?.businessId);
      return token;
    },
  },
});

import NextAuth, { CredentialsSignin } from "next-auth";
import type { Provider } from "next-auth/providers";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { clear, clientIp, consume } from "@/lib/security/rateLimit";
import { authConfig } from "./auth.config";

export class RateLimitedSignin extends CredentialsSignin {
  code = "rate_limited";
}

const providers: Provider[] = [
  Credentials({
    credentials: { email: {}, password: {} },
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

      await Promise.all([clear("login", email), clear("loginIp", ip)]);
      return { id: user.id, name: user.name, email: user.email };
    },
  }),
];

if (process.env.AUTH_GOOGLE_ID) providers.push(Google);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user?.id) {
        token.uid = user.id;
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

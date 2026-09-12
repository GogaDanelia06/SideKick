import type { NextAuthConfig } from "next-auth";
import { gateAllows } from "@/lib/auth/gate";

export const authConfig = {
  trustHost: true,
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  providers: [],
  callbacks: {

    // Shared with proxy.ts through gateAllows.
    authorized({ auth, request: { nextUrl } }) {
      return gateAllows(nextUrl.pathname, auth?.user);
    },

    session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid as string;
        session.user.businessId = token.businessId as string | undefined;
        session.user.role = token.role as string | undefined;
        session.user.isAdmin = (token.isAdmin as boolean | undefined) ?? false;
        // Needed by `authorized` above, which sees the session and not the token.
        session.user.remember = token.remember as boolean | undefined;
        session.user.startedAt = token.startedAt as number | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

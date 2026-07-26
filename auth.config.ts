import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  providers: [],
  callbacks: {

    authorized({ auth, request: { nextUrl } }) {
      const { pathname } = nextUrl;

      if (pathname.startsWith("/admin")) {
        if (!auth?.user) return false;
        if (!auth.user.isAdmin) return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      if (pathname.startsWith("/dashboard")) return !!auth?.user;
      return true;
    },

    session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid as string;
        session.user.businessId = token.businessId as string | undefined;
        session.user.role = token.role as string | undefined;
        session.user.isAdmin = (token.isAdmin as boolean | undefined) ?? false;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

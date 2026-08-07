import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  providers: [],
  callbacks: {

    authorized({ auth, request: { nextUrl } }) {
      const { pathname } = nextUrl;

      // Signed in or not is the only question this layer can answer honestly.
      //
      // It used to decide admin access here as well, from `isAdmin` on the
      // token — a value copied in at sign-in and then believed for a week. That
      // is wrong in both directions: granting someone the flag left them shut
      // out until they happened to sign in again, and taking it away left them
      // an admin for seven days. It reads the session, and the session is a
      // snapshot.
      //
      // `requireAdmin()` in the admin layout asks the database instead, and
      // every page under /admin goes through it. Middleware runs on the edge
      // where that query is not available, so the check belongs there, not here.
      if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
        return !!auth?.user;
      }
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

import type { NextAuthConfig } from "next-auth";
import { sessionIsStale } from "@/lib/auth/sessionExpiry";

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
        if (!auth?.user) return false;
        // A session cookie the browser restored after being closed still looks
        // valid here, so age is the only thing that gives it away.
        return !sessionIsStale(auth.user);
      }
      return true;
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

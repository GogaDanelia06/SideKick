import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  pages: { signIn: "/login" },
  // 7-day sessions, silently refreshed at most once a day.
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  providers: [],
  callbacks: {

    authorized({ auth, request: { nextUrl } }) {
      const onDashboard = nextUrl.pathname.startsWith("/dashboard");
      if (onDashboard) return !!auth?.user;
      return true;
    },
  },
} satisfies NextAuthConfig;

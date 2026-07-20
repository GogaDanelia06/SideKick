import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {

    authorized({ auth, request: { nextUrl } }) {
      const onDashboard = nextUrl.pathname.startsWith("/dashboard");
      if (onDashboard) return !!auth?.user;
      return true;
    },
  },
} satisfies NextAuthConfig;

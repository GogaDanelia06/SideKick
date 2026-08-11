import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      businessId?: string;
      role?: string;
      isAdmin?: boolean;
      /** Carried onto the session so edge middleware can age it out. */
      remember?: boolean;
      startedAt?: number;
    } & DefaultSession["user"];
  }

  /** What `authorize()` returns, so the sign-in choice reaches the `jwt` callback. */
  interface User {
    remember?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    businessId?: string;
    role?: string;
    isAdmin?: boolean;
    /** See lib/auth/sessionExpiry.ts. */
    remember?: boolean;
    startedAt?: number;
  }
}

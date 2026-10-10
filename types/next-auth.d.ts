import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      businessId?: string;
      role?: string;
      isAdmin?: boolean;
      remember?: boolean;
      startedAt?: number;
    } & DefaultSession["user"];
  }

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
    remember?: boolean;
    startedAt?: number;
  }
}

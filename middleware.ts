import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge middleware: uses the adapter-free auth config (no Prisma/bcrypt) to read
// the session cookie and enforce the `authorized` callback. Unauthenticated
// requests to /dashboard are redirected to /login.
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};

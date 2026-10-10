import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { gateAllows } from "@/lib/auth/gate";
import { IDLE_COOKIE, isIdle, needsRefresh, readMarker, stampMarker } from "@/lib/auth/idle";
import { expiredCookie, isSignInCookie } from "@/lib/auth/sessionCookie";

const { auth } = NextAuth(authConfig);

export default auth(async (request) => {
  const { pathname } = request.nextUrl;
  const user = request.auth?.user;

  const signOut = () => {
    const url = request.nextUrl.clone();
    url.search = "";
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`);
    const res = NextResponse.redirect(url);
    res.cookies.delete(IDLE_COOKIE);
    const secure = request.nextUrl.protocol === "https:";
    for (const { name } of request.cookies.getAll()) {
      if (isSignInCookie(name)) res.cookies.set(expiredCookie(name, secure));
    }
    return res;
  };

  if (!gateAllows(pathname, user)) return signOut();

  if (!user) return NextResponse.next();

  if (user.remember) return NextResponse.next();

  const secret = process.env.AUTH_SECRET;
  if (!secret) return NextResponse.next();

  const marker = await readMarker(request.cookies.get(IDLE_COOKIE)?.value, secret);
  const seenAt = marker !== null && marker >= (user.startedAt ?? 0) ? marker : null;

  if (seenAt !== null && isIdle(seenAt)) return signOut();

  const res = NextResponse.next();
  if (seenAt === null || needsRefresh(seenAt)) {
    res.cookies.set(IDLE_COOKIE, await stampMarker(secret), {
      httpOnly: true,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      path: "/",
    });
  }
  return res;
});

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/admin", "/admin/:path*"],
};

import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { gateAllows } from "@/lib/auth/gate";
import { IDLE_COOKIE, isIdle, needsRefresh, readMarker, stampMarker } from "@/lib/auth/idle";

const { auth } = NextAuth(authConfig);

/**
 * Guards signed-in areas and ends idle sessions (Next 16's name for middleware).
 * A handler passed to `auth()` disables next-auth's own redirect, so `gateAllows`
 * decides here — the same rule the `authorized` callback uses.
 */
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
    return res;
  };

  if (!gateAllows(pathname, user)) return signOut();

  if (!user) return NextResponse.next();

  if (user.remember) return NextResponse.next();

  const secret = process.env.AUTH_SECRET;
  if (!secret) return NextResponse.next();

  const seenAt = await readMarker(request.cookies.get(IDLE_COOKIE)?.value, secret);

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

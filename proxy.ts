import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { gateAllows } from "@/lib/auth/gate";
import { IDLE_COOKIE, isIdle, needsRefresh, readMarker, stampMarker } from "@/lib/auth/idle";

const { auth } = NextAuth(authConfig);

/**
 * Guards the signed-in areas, and ends sessions that have gone quiet.
 *
 * Named `proxy.ts` because Next 16 renamed the convention. `middleware.ts` still
 * works but warns on every dev start; the default export and `config.matcher`
 * below are read exactly as before.
 *
 * Passing a handler to `auth()` takes next-auth's own redirect out of the
 * picture — its `!authorized` branch is an `else if` that never runs once a
 * handler exists. So the decision is made here, through the same `gateAllows`
 * the `authorized` callback uses: one rule, two callers, and no way for them to
 * drift into disagreeing about who gets in. Deleting that shared call would not`
 * fail any test; it would quietly open the dashboard to signed-out visitors.
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

import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { gateAllows } from "@/lib/auth/gate";
import { IDLE_COOKIE, isIdle, needsRefresh, readMarker, stampMarker } from "@/lib/auth/idle";

const { auth } = NextAuth(authConfig);

/**
 * Guards the signed-in areas, and ends sessions that have gone quiet.
 *
 * Called `proxy.ts` because Next 16 renamed the convention; `middleware.ts` still
 * works but warns on every dev start. Nothing else changed — the default export
 * and the `config.matcher` below are read exactly as before.
 *
 * Passing a handler to `auth()` takes next-auth's own redirect out of the
 * picture — its `!authorized` branch is an `else if` that never runs once a
 * handler exists. So the decision is made here, through the same `gateAllows`
 * the `authorized` callback uses: one rule, two callers, no way for them to
 * drift into disagreeing about who gets in.
 */
export default auth(async (request) => {
  const { pathname } = request.nextUrl;
  const user = request.auth?.user;

  const signOut = () => {
    const url = request.nextUrl.clone();
    url.search = "";
    url.pathname = "/login";
    // A path, not the full href next-auth used to send: `safeCallbackUrl`
    // rejects anything that does not start with "/", so the old value always
    // fell back to the dashboard home and nobody landed where they had been.
    url.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`);
    const res = NextResponse.redirect(url);
    // Clear the marker too, so the next sign-in starts its own clock instead of
    // inheriting a stale one and being thrown straight back out.
    res.cookies.delete(IDLE_COOKIE);
    return res;
  };

  if (!gateAllows(pathname, user)) return signOut();

  // Public pages, and anyone not signed in, have no session to time out.
  if (!user) return NextResponse.next();

  // Being remembered is a deliberate "keep me here", and honouring it is the
  // whole difference the checkbox makes.
  if (user.remember) return NextResponse.next();

  const secret = process.env.AUTH_SECRET;
  if (!secret) return NextResponse.next();

  const seenAt = await readMarker(request.cookies.get(IDLE_COOKIE)?.value, secret);

  // No usable marker is a fresh visit, not an idle one. Reading it the other
  // way would sign out every user already online the moment this ships.
  if (seenAt !== null && isIdle(seenAt)) return signOut();

  const res = NextResponse.next();
  if (seenAt === null || needsRefresh(seenAt)) {
    res.cookies.set(IDLE_COOKIE, await stampMarker(secret), {
      httpOnly: true,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      path: "/",
      // No maxAge on purpose: it should die with the browser wherever the
      // browser actually allows that, and the timestamp covers the rest.
    });
  }
  return res;
});

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/admin", "/admin/:path*"],
};

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sessionCookies } from "@/lib/auth/sessionCookie";

export const dynamic = "force-dynamic";

/**
 * Turns the session cookie into one that dies with the browser.
 *
 * Sessions are seven days by configuration, which is right for someone who
 * asked to be remembered and wrong for everyone else: on a shared machine the
 * next person to open the browser is already signed in as them. The login form
 * offered a "remember me" box for exactly this and it did nothing.
 *
 * The cookie is rewritten rather than reissued. The value — the signed JWT — is
 * untouched, so nothing about who the visitor is or how long the token is valid
 * for changes; only whether the browser keeps the cookie after it closes.
 * Dropping `maxAge` and `expires` is what makes it a session cookie.
 *
 * Chunked cookies are handled because a large session is split across
 * `…session-token.0`, `.1` and so on, and leaving one chunk persistent would
 * store half a credential.
 *
 * Lives under `/api/session` rather than `/api/auth`, where it would sit inside
 * Auth.js's `[...nextauth]` catch-all. A static segment does win over a catch-all
 * today, so it worked there — but it worked by a routing precedence rule rather
 * than by design, and an Auth.js route named `remember` would have swallowed it
 * with nothing to show for the change but a box that had stopped working.
 */
export async function POST() {
  // Only for someone who is actually signed in: without this, anybody could
  // poke at cookie attributes on a request they do not own.
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const jar = await cookies();
  const secure = process.env.NODE_ENV === "production";

  const chunks = sessionCookies(jar.getAll());
  for (const cookie of chunks) {
    jar.set(cookie.name, cookie.value, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure,
      // No maxAge and no expires: that is the whole point.
    });
  }

  return NextResponse.json({ ok: true, rewritten: chunks.length });
}

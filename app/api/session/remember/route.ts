import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sessionCookies } from "@/lib/auth/sessionCookie";

export const dynamic = "force-dynamic";

/**
 * Turns the session cookie into a browser-session cookie ("remember me" off): the
 * same JWT without an expiry. Chunked cookies are rewritten too.
 */
export async function POST() {
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
    });
  }

  return NextResponse.json({ ok: true, rewritten: chunks.length });
}

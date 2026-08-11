import { describe, it, expect } from "vitest";
import { sessionCookies } from "./sessionCookie";

const named = (...names: string[]) => names.map((name) => ({ name }));

describe("sessionCookies()", () => {
  it("finds the cookie as it is named over http", () => {
    expect(sessionCookies(named("authjs.session-token"))).toHaveLength(1);
  });

  it("finds it with the __Secure- prefix the browser gets over https", () => {
    expect(sessionCookies(named("__Secure-authjs.session-token"))).toHaveLength(1);
  });

  it("finds every chunk of a session too large for one cookie", () => {
    // Missing one would leave half a credential persistent after the other half
    // had been scoped to the window — signed in, or not, depending on which
    // half the browser kept.
    const found = sessionCookies(
      named("__Secure-authjs.session-token.0", "__Secure-authjs.session-token.1"),
    );

    expect(found.map((c) => c.name)).toEqual([
      "__Secure-authjs.session-token.0",
      "__Secure-authjs.session-token.1",
    ]);
  });

  it("leaves other cookies alone", () => {
    const found = sessionCookies(
      named(
        "authjs.csrf-token",
        "__Secure-authjs.callback-url",
        "authjs.session-token",
        "_ga",
      ),
    );

    expect(found.map((c) => c.name)).toEqual(["authjs.session-token"]);
  });

  it("does not match a name that merely contains it", () => {
    // Anchored at the end, so a cookie called `authjs.session-token-backup`
    // belonging to something else is not rewritten.
    expect(sessionCookies(named("authjs.session-token-backup"))).toHaveLength(0);
  });
});

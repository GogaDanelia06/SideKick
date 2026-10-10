export function guard() {
  const url = process.env.DATABASE_URL ?? "";
  const local = /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(url);
  if (!local || process.env.NODE_ENV === "production") {
    console.error(
      "refusing to run: this script fakes a bank confirmation and must never\n" +
        "touch a real database. It only runs against localhost.",
    );
    process.exit(1);
  }
}

export function stubBank(outcome: "ok" | "fail") {
  const real = globalThis.fetch;
  globalThis.fetch = (async (url: unknown, init?: RequestInit) => {
    const u = String(url);

    if (u.includes("oauth2.bog.ge")) {
      return Response.json({ access_token: "stub", expires_in: 3600 });
    }
    if (u.includes("api.bog.ge") && u.includes("/receipt/")) {
      return Response.json({
        order_status: { key: outcome === "ok" ? "completed" : "rejected" },
        reject_reason: outcome === "ok" ? null : "simulated failure",
      });
    }

    if (u.includes("/tpay/access-token")) {
      return Response.json({ access_token: "stub", expires_in: 3600 });
    }
    if (u.includes("/tpay/payments/")) {
      return Response.json({
        status: outcome === "ok" ? "Succeeded" : "Failed",
        recId: outcome === "ok" ? "stub-saved-card" : null,
        userMessage: outcome === "ok" ? null : "simulated failure",
      });
    }

    return real(url as string, init);
  }) as typeof fetch;
}

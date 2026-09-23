/** The browser side of the account switcher (app/api/accounts/route.ts). */
type Facts = { isAdmin?: boolean; hasBusiness?: boolean };
export type AccountsReply = ({ ok: true; next?: Facts | null } & Facts) | { ok: false; error: string };

export async function accountsRequest(
  action: "add" | "switch" | "remove" | "leave" | "clear",
  uid?: string,
): Promise<AccountsReply> {
  try {
    const res = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ action, uid }),
    });
    return (await res.json()) as AccountsReply;
  } catch {
    return { ok: false, error: "failed" };
  }
}

/** Where a switched-to account opens: an admin stays in the admin panel, anyone else goes to the dashboard. */
export function landingAfterSwitch(reply: Facts, wanted: string): string {
  if (wanted.startsWith("/admin")) return reply.isAdmin ? wanted : "/dashboard";
  if (!reply.hasBusiness && reply.isAdmin) return "/admin";
  return wanted.startsWith("/dashboard") ? wanted : "/dashboard";
}

/** The login page for one account, its email filled in, returning to where this started. */
export const loginUrl = (back: string, email?: string) =>
  `/login?${new URLSearchParams({ callbackUrl: back, ...(email ? { email } : {}) })}`;

/** Logging out ends every account on this browser, so the button says so when there are several. */
export const logOutLabel = (others: number) =>
  others > 0 ? "auth.accountsClient.logOutOfAll" : "auth.accountsClient.logOut";

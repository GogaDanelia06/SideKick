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

export function landingAfterSwitch(reply: Facts, wanted: string): string {
  if (wanted.startsWith("/admin")) return reply.isAdmin ? wanted : "/dashboard";
  if (!reply.hasBusiness && reply.isAdmin) return "/admin";
  return wanted.startsWith("/dashboard") ? wanted : "/dashboard";
}

export const loginUrl = (back: string, email?: string) =>
  `/login?${new URLSearchParams({ callbackUrl: back, ...(email ? { email } : {}) })}`;

export const logOutLabel = (others: number) =>
  others > 0 ? "auth.accountsClient.logOutOfAll" : "auth.accountsClient.logOut";

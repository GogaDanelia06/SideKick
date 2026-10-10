import { sessionIsStale, type SessionAge } from "./sessionExpiry";

const GUARDED = ["/admin", "/dashboard"];

export function gateAllows(pathname: string, user: SessionAge | undefined | null): boolean {
  if (!GUARDED.some((prefix) => pathname.startsWith(prefix))) return true;
  if (!user) return false;

  return !sessionIsStale(user);
}

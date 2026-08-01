export const ROUTES = {
  home: "/",
  about: "/about",
  pricing: "/pricing",
  contact: "/contact",
  login: "/login",
  register: "/register",
  /** Sends the visitor to billing, signing them up first if they aren't yet. */
  start: "/start",
  forgot: "/forgot",
  reset: "/reset",
  terms: "/terms",
  privacy: "/privacy",
  dataProtection: "/data-protection",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

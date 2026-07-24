export const ROUTES = {
  home: "/",
  about: "/about",
  pricing: "/pricing",
  contact: "/contact",
  login: "/login",
  register: "/register",
  forgot: "/forgot",
  reset: "/reset",
  terms: "/terms",
  privacy: "/privacy",
  dataProtection: "/data-protection",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

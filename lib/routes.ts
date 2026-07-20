export const ROUTES = {
  home: "/",
  about: "/about",
  pricing: "/pricing",
  contact: "/contact",
  login: "/login",
  register: "/register",
  forgot: "/forgot",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

export const DASH = {
  home: "/dashboard",
  conversations: "/dashboard/conversations",
  ai: "/dashboard/ai",
  channels: "/dashboard/channels",
  products: "/dashboard/products",
  orders: "/dashboard/orders",
  leads: "/dashboard/leads",
  analytics: "/dashboard/analytics",
  team: "/dashboard/team",
  billing: "/dashboard/billing",
  videos: "/dashboard/videos",
  profile: "/dashboard/profile",
} as const;

export type DashPath = (typeof DASH)[keyof typeof DASH];

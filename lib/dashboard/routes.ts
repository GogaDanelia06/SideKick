/** Dashboard route table. Kept apart from the marketing ROUTES so the two
 *  areas of the app never accidentally cross-link. */
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

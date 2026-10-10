export type PlatformStats = {
  businesses: { total: number; newThisMonth: number };
  users: number;
  conversations: { total: number; active: number };
  messages: { total: number; byAi: number; aiSharePct: number };
  tenantSales: { orders: number; total: number };
  leads: { total: number; converted: number };
  channelsConnected: number;
  products: number;
  income: {
    mrr: number;
    collectedThisMonth: number;
    collectedTotal: number;
    failedThisMonth: number;
    pending: number;
  };
  subscriptions: { trial: number; active: number; pastDue: number; cancelled: number };
  plans: { name: string; key: string; price: number; subscribers: number }[];
  growth: { month: string; count: number }[];
};

import {
  AI_CONFIG,
  CHANNELS,
  FAQS,
  LEADS,
  PAYMENTS,
  PLANS,
  PRODUCTS,
  TEAM_MEMBERS,
  VIDEOS,
} from "@/prisma/seed-data";

const createdAt = new Date("2026-07-01T10:00:00.000Z");

export function getLeads(_businessId: string) {
  return LEADS.map((lead, index) => ({
    id: `lead-${index + 1}`,
    businessId: "demo-business",
    createdAt,
    updatedAt: createdAt,
    ...lead,
  })) as any;
}

export function getProducts(_businessId: string) {
  return PRODUCTS.map((product, index) => ({
    id: `product-${index + 1}`,
    businessId: "demo-business",
    imageUrl: null,
    size: null,
    salePrice: null,
    discountPct: null,
    createdAt,
    updatedAt: createdAt,
    ...product,
  })) as any;
}

export function getVideos(_businessId: string) {
  return VIDEOS.map((video, index) => ({
    id: `video-${index + 1}`,
    businessId: "demo-business",
    createdAt,
    updatedAt: createdAt,
    ...video,
  })) as any;
}

export function getChannels(_businessId: string) {
  return CHANNELS.map((channel, index) => ({
    id: `channel-${index + 1}`,
    businessId: "demo-business",
    lastSyncAt: channel.connected ? createdAt : null,
    createdAt,
    updatedAt: createdAt,
    ...channel,
  })) as any;
}

export function getTeam(_businessId: string) {
  return TEAM_MEMBERS.map((member, index) => ({
    id: `member-${index + 1}`,
    businessId: "demo-business",
    userId: `user-${index + 1}`,
    role: member.role,
    createdAt,
    updatedAt: createdAt,
    user: {
      id: `user-${index + 1}`,
      name: member.name,
      email: member.email,
      phone: null,
      passwordHash: null,
      createdAt,
      updatedAt: createdAt,
    },
  })) as any;
}

export function getBilling(
  _businessId: string,
  _userId: string,
) {
  const plan = {
    id: "plan-standard",
    ...PLANS[1],
    createdAt,
    updatedAt: createdAt,
  };

  const subscription = {
    id: "subscription-demo",
    businessId: "demo-business",
    planId: plan.id,
    usedMessages: 2350,
    cardRef: "4242",
    status: "ACTIVE",
    createdAt,
    updatedAt: createdAt,
    plan,
  };

  const payments = PAYMENTS.map((payment, index) => ({
    id: `payment-${index + 1}`,
    businessId: "demo-business",
    date: new Date(payment.date),
    status: "PAID",
    createdAt,
    updatedAt: createdAt,
    ...payment,
  }));

  return {
    subscription,
    payments,
    plans: PLANS,
    cardName: "Demo Client",
  } as any;
}

export function getAiConfig(_businessId: string) {
  const config = {
    id: "ai-config-demo",
    businessId: "demo-business",
    createdAt,
    updatedAt: createdAt,
    ...AI_CONFIG,
  };

  const faqs = FAQS.map((faq, index) => ({
    id: `faq-${index + 1}`,
    businessId: "demo-business",
    createdAt,
    updatedAt: createdAt,
    ...faq,
  }));

  return { config, faqs } as any;
}

export function getProfile(
  _userId: string,
  _businessId: string,
) {
  return {
    user: {
      id: "demo-user",
      name: "Demo Client",
      email: "demo@sidekick.ge",
      phone: "+995 555 12 34 56",
      passwordHash: null,
      createdAt,
      updatedAt: createdAt,
    },
    business: {
      id: "demo-business",
      name: "Sidekick Demo",
      field: "E-commerce",
      description: "Client dashboard demonstration account",
      createdAt,
      updatedAt: createdAt,
    },
  } as any;
}
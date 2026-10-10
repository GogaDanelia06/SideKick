export const ready = {
  customerRef: "PSID_1",
  channel: {
    type: "FACEBOOK",
    connected: true,
    externalId: "PAGE_1",
    accessToken: "page-token",
  },
};

export const ok = (body: unknown) =>
  ({ ok: true, status: 200, json: async () => body }) as unknown as Response;

export const refused = (status: number, body: unknown) =>
  ({ ok: false, status, json: async () => body }) as unknown as Response;

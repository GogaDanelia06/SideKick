# API overview

Sidekick has a deliberately small HTTP surface. Almost every mutation is a
**Server Action**, not an endpoint; only the four things that genuinely have to
be reachable over HTTP are route handlers.

- [HTTP endpoints](#http-endpoints)
- [Server Actions](#server-actions)
- [Query functions](#query-functions)
- [Adding new endpoints](#adding-a-new-endpoint)

---

## HTTP endpoints

All under `app/api/`. All accept and return JSON unless stated otherwise.

### `POST /api/auth/register`

Creates a user, then provisions their business.

**Body**

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `firstName` | string | yes | |
| `lastName` | string | no | defaults to `""` |
| `email` | string | yes | lower-cased before storage; must be unique |
| `password` | string | yes | 8+ chars, at least one letter and one digit |
| `phone` | string | no | |
| `company` | string | no | business name; falls back to `"<firstName>'s business"` |
| `field` | string | no | industry |

**Responses**

| Status | Body | When |
| --- | --- | --- |
| `200` | `{ "ok": true }` | created |
| `400` | `{ "error": "<first validation message>" }` | schema failure |
| `409` | `{ "error": "ეს მეილი უკვე რეგისტრირებულია" }` | address taken |
| `429` | `{ "error": "…" }` + `Retry-After` | more than 5 per hour from one IP |

**Side effects** — `lib/provision.ts` creates the Business, an `OWNER`
Membership, a default `AiConfig`, four `Channel` rows (Facebook, Instagram,
WhatsApp, Website) and a `TRIAL` Subscription on the Basic plan.

`emailVerified` is set immediately. There is no verification email yet; that is
a one-line change once a mail provider is configured.

---

### `POST /api/auth/forgot`

Requests a password-reset link.

**Body** — `{ "email": string }`

**Responses**

| Status | Body | When |
| --- | --- | --- |
| `200` | `{ "ok": true }` | **always**, whether or not the address exists |
| `400` | `{ "error": "…" }` | malformed email |
| `429` | `{ "error": "…" }` + `Retry-After` | 3/hour per address, or 10/hour per IP |

The identical 200 is the point: a different response for unknown addresses would
turn this into an account-enumeration oracle. Unknown addresses are logged
server-side instead, which is how a sweep would be noticed.

Issuing a token invalidates any previous unused token for that user.

> With no mail provider configured, the email is printed to the server console
> including the reset link. See [DEPLOYMENT.md](DEPLOYMENT.md#email).

---

### `POST /api/auth/reset`

Sets a new password using a token from the reset link.

**Body**

| Field | Type | Notes |
| --- | --- | --- |
| `token` | string | 64 hex chars from the emailed link |
| `password` | string | same rule as registration |
| `repeatPassword` | string | must match |

**Responses**

| Status | Body | When |
| --- | --- | --- |
| `200` | `{ "ok": true }` | password changed |
| `400` | `{ "error": "…" }` | validation failure, or token invalid/expired/used |
| `429` | `{ "error": "…" }` + `Retry-After` | more than 10 per hour from one IP |

The password write and the token spend happen in one transaction, so a token can
never be burned without the password actually changing. A confirmation email is
sent afterwards.

---

### `/api/auth/[...nextauth]`

The Auth.js catch-all — sign-in, sign-out, callbacks, CSRF, session. Not
hand-written; do not modify. Configuration lives in `auth.ts` and
`auth.config.ts`.

The credentials provider is rate limited inside `authorize()`: 5 failed attempts
per address and 30 per IP per 15 minutes. A successful sign-in clears both
counters. When the limiter blocks a request, `authorize()` throws
`RateLimitedSignin`, whose `code` (`"rate_limited"`) reaches the browser so the
login form can show a lockout message rather than "wrong password".

---

## Server Actions

Defined in `lib/dashboard/actions.ts` (`"use server"`). Called directly from
client components — there is no URL to document, and none of these are part of a
public API surface.

**Every action follows the same shape:**

```ts
export async function doThing(input): Promise<ActionResult> {
  const ctx = await requirePermission("thing:write");   // 1. authorize
  if (!ctx) return { ok: false, error: "forbidden" };
  await prisma.thing.updateMany({                       // 2. tenant-scoped write
    where: { id, businessId: ctx.businessId },
    data: { … },
  });
  revalidatePath(DASH.things);                          // 3. refresh the screen
  return { ok: true };
}
```

`requirePermission` returns `null` both when the caller is signed out and when
their role lacks the permission — the two are indistinguishable to a probe.

The `businessId` in the `where` clause is not decoration. `updateMany` with a
foreign id matches zero rows and silently does nothing, which is exactly the
desired behaviour for a forged request.

**Return type**

```ts
type ActionResult = { ok: true } | { ok: false; error: string };
```

`error` is a machine code (`"forbidden"`, `"title_required"`, `"bad_url"`,
`"email_required"`, …), never raw database text. The client maps the code to a
bilingual message — see the `ERRORS` map in each view component.

### Inventory

| Action | Permission | Notes |
| --- | --- | --- |
| `setChannelConnected` | `channels:write` | flips the record; no real OAuth |
| `setOrderStatus` | `orders:write` | |
| `saveAiCharacter` | `ai:write` | |
| `saveAiRules` | `ai:write` | |
| `saveAiPrompt` | `ai:write` | |
| `setAiLanguages` | `ai:write` | |
| `saveBusinessInfo` | `business:write` | |
| `createProduct` | `products:write` | |
| `updateProduct` | `products:write` | |
| `deleteProduct` | `products:write` | |
| `saveProfile` | mixed | splits user fields from business fields by `can(role, "business:write")` |
| `createLead` | `leads:write` | |
| `setLeadStatus` | `leads:write` | |
| `updateLeadComment` | `leads:write` | |
| `deleteLead` | `leads:write` | |
| `createVideo` | `videos:write` | normalises YouTube URLs; rejects other hosts |
| `deleteVideo` | `videos:write` | |
| `setConversationAi` | `conversations:write` | AI on/off per conversation |
| `addTeamMember` | `team:manage` | creates an account shell if the address is new |
| `updateMemberRole` | `team:manage` | |
| `removeTeamMember` | `team:manage` | |
| `changePlan` | `billing:manage` | OWNER only |

---

## Query functions

`lib/dashboard/queries.ts`. Reads only, called from server components.

**Every one takes `businessId` as a required argument.** That is the single
invariant that keeps tenants apart — a query without it would return another
customer's data.

| Function | Returns |
| --- | --- |
| `getHomeOverview(businessId)` | dashboard home cards + recent activity |
| `getAnalytics(businessId, …)` | computed aggregates over the selected range |
| `getConversations(businessId, channel?)` | conversation list, optionally filtered |
| `getConversation(businessId, id)` | one thread with messages |
| `getOrders(businessId)` | orders with their items |
| `getAiConfig(businessId)` | assistant settings |
| `getBilling(businessId, userId)` | plan, subscription, payment history |
| `getAccount(userId, businessId)` | header/profile-menu identity |
| `getProfile(userId, businessId)` | profile screen fields |

Products, leads, team members and videos are read inline in their pages via
Prisma, always with `where: { businessId }`.

---

## Adding a new endpoint

1. **Prefer a Server Action.** If the only caller is the dashboard, an action is
   less code and keeps the permission check next to the mutation.
2. If it must be HTTP, put it in `app/api/<name>/route.ts`.
3. Validate the body with a Zod schema in `lib/validation/`. Never trust
   `req.json()` directly.
4. Authorize with `requirePermission()` — or `getContext()` plus an explicit
   `can()` check when the rule is more nuanced.
5. Scope every Prisma call by `ctx.businessId`.
6. Rate limit anything unauthenticated. Add a rule to `LIMITS` in
   `lib/security/rateLimit.ts` and call `consume()` before doing the work.
7. Return machine-readable error codes, not database messages.
8. Log failures through `lib/logger.ts` so secrets get redacted.

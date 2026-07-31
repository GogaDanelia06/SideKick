# Architecture

How Sidekick is put together, and why it is put together that way. Written for a
developer who has never seen the codebase.

---

## The shape of it

Sidekick is a single Next.js 16 application with two distinct halves sharing one
deployment:

- **The marketing site** (`app/(marketing)`, `app/(auth)`) — public, statically
  rendered, no database access, heavily SEO-tuned.
- **The dashboard** (`app/dashboard`) — authenticated, server-rendered per
  request, every query scoped to one tenant.

They share the layout shell, the design tokens, the language system and the UI
primitives. They do not share rendering strategy: keeping the marketing pages
static is a deliberate constraint that shows up in several decisions below.

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16, App Router, React 19, TypeScript strict |
| Styling | Tailwind CSS v4, `@theme inline` over CSS variables |
| Database | PostgreSQL via Prisma 6 (multi-file schema) |
| Auth | Auth.js (next-auth v5 beta), JWT sessions |
| Validation | Zod |
| Hosting | Vercel + Neon serverless Postgres |

---

## Directory map

```
app/
  layout.tsx              Root: fonts, no-flash theme script, providers, chat widget
  (marketing)/            Public pages — home, about, pricing, contact, legal
  (auth)/                 login, register, forgot, reset — footer-less shell
  dashboard/              Authenticated area, one folder per screen
  api/auth/               register, forgot, reset + the Auth.js catch-all
  error.tsx               Route-level error boundary
  global-error.tsx        Last-resort boundary (replaces the whole document)

components/
  ui/                     Primitives: Container, Card, Badge, Button, Field
  layout/                 Header, Nav, Footer, theme + language toggles
  seo/                    JsonLd emitter
  home/ pricing/ about/   Marketing sections
  contact/ legal/ chat/
  auth/                   Login, register, forgot, reset forms
  dashboard/<screen>/     One folder per dashboard screen
  dashboard/ui/           Dashboard-only primitives (Panel, StatCard, …)
  admin/<screen>/         Platform-owner content editors (stats, plans, faq, seo)

lib/
  db.ts                   Prisma singleton
  env.ts                  Lazy environment validation
  session.ts              getContext / requireContext — the tenant boundary
  provision.ts            What a brand-new business gets on registration
  logger.ts               Structured logging with automatic redaction
  auth/permissions.ts     Role → permission matrix
  auth/admin.ts           requireAdmin — platform-owner guard (DB re-check)
  auth/passwordReset.ts   Hashed, single-use, expiring reset tokens
  security/rateLimit.ts   Database-backed sliding-window limiter
  dashboard/queries.ts    Every read. All take businessId.
  dashboard/actions.ts    Every write. All permission-gated Server Actions.
  admin/actions.ts        Admin content writes. All requireAdmin-gated.
  site/content.ts         Reads for admin-editable public content
  content/                All user-facing copy, bilingual
  i18n/ theme/            Language and theme contexts
  mail/                   Provider-agnostic email abstraction
  seo/                    Site constants, metadata builders, JSON-LD schemas
  chat/bot.ts             Keyword bot behind the marketing chat widget

prisma/schema/            Multi-file schema + migrations
```

---

## Multi-tenancy

Every business is a tenant. Tenants share tables and are separated by a
`businessId` column — not by a schema or a database per tenant.

**Why shared tables.** The product targets on the order of tens of subscribers,
each with modest data. Per-tenant schemas would mean running every migration N
times and would make cross-tenant reporting (which the future admin panel needs)
awkward. Shared tables with a mandatory filter and indexes on `businessId` is
the standard answer at this size, and it is the one the whole codebase assumes.

**Where the boundary is enforced.** In exactly one place:

```ts
// lib/session.ts
export async function getContext(): Promise<Ctx | null>   // { userId, businessId, role }
export async function requireContext(): Promise<Ctx>      // same, or redirect to /login
```

Every dashboard page begins with `requireContext()` and passes `ctx.businessId`
into its queries. Every function in `lib/dashboard/queries.ts` takes
`businessId` as a required first argument — there is no query in the codebase
that can be called without one. That is the invariant to preserve: **if you add
a query that does not take a tenant id, you have created a data leak.**

**Defence in depth.** Three independent layers, each sufficient on its own:

1. `middleware.ts` — blocks unauthenticated requests to `/dashboard/*` at the
   edge, before any page code runs.
2. `requireContext()` in each page — redirects if the session is missing, and is
   what actually supplies the tenant id.
3. Every write re-reads the record with `businessId` in the `where` clause, so a
   forged id belonging to another tenant matches nothing.

---

## Authentication

Auth.js v5 with the **JWT** session strategy. The config is deliberately split
in two:

- `auth.config.ts` — edge-safe. No Prisma, no bcrypt. This is what
  `middleware.ts` imports, because the edge runtime cannot run either.
- `auth.ts` — the full config: Prisma adapter, credentials provider, optional
  Google provider, and the `jwt` / `session` callbacks.

Sessions last 7 days and refresh at most once a day.

**What the token carries.** On sign-in the `jwt` callback looks up the user's
first membership and stores `uid`, `businessId` and `role` in the token. The
`session` callback copies them onto `session.user`. This means one database
round-trip at sign-in instead of one on every request.

> **Known consequence:** because the role lives in the token, a role change does
> not take effect until the user signs in again (up to 7 days). Documented in
> [HANDOVER.md](HANDOVER.md#known-gaps-and-deliberate-trade-offs) with the fix.

**Passwords.** bcrypt, cost 10. The rule (8+ characters, at least one letter and
one digit) lives in `lib/validation/auth.ts` as a single `passwordSchema` used by
both registration and reset, so the two cannot drift apart.

**Password reset.** `lib/auth/passwordReset.ts`. The raw token goes in the email
and is never stored; only a SHA-256 hash is. Tokens are single-use, expire in 60
minutes, and requesting a new one invalidates the previous. The `/api/auth/forgot`
endpoint returns the same 200 response whether or not the address exists.

---

## Authorization

Four roles, one matrix, one enforcement point:

```
OWNER      everything, including billing
ADMIN      everything except billing
OPERATOR   conversations, orders, leads
VIEWER     read-only
```

`lib/auth/permissions.ts` exposes:

- `can(role, permission)` — pure, safe to call in a server component to decide
  what to render.
- `requirePermission(permission)` — returns the context or `null`. Every Server
  Action in `lib/dashboard/actions.ts` starts with this call.

Hiding a button is a convenience, not a control. The server check is the
control, and it is what was tested: the same crafted request under three
different roles produced allow / deny exactly per the matrix.

**Platform admin is separate.** The four roles above are scoped to one business.
The *platform owner* — the person who runs the whole site — is a different axis:
a `User.isAdmin` flag, guarding the `/admin` area, granted only by the
`admin:grant` script (never through the UI). `lib/auth/admin.ts` enforces it,
re-reading the flag from the database on each request so a revoked admin is
locked out immediately. See [HANDOVER.md](HANDOVER.md#admin-panel).

---

## Data flow

**Reads.** Server component → `requireContext()` → `lib/dashboard/queries.ts` →
Prisma → props. No client-side data fetching in the dashboard; no API layer in
between. Slow sections are wrapped in `<Suspense>` with a matching
`loading.tsx` skeleton.

**Writes.** Client component → Server Action in `lib/dashboard/actions.ts` →
`requirePermission()` → Prisma → `revalidatePath()`. Actions return a small
`ActionResult` (`{ ok: true }` or `{ ok: false, error: "code" }`); the client
maps the code to a bilingual message. Error codes never carry raw database text.

**Why Server Actions instead of REST.** The dashboard is the only consumer.
Actions remove a whole layer of hand-written route handlers, request parsing and
response typing, and they keep the permission check adjacent to the mutation.
The four things that genuinely need to be HTTP endpoints — register, forgot,
reset, and the Auth.js catch-all — are route handlers. See [API.md](API.md).

---

## Styling and theming

Tailwind v4 with design tokens defined once in `app/globals.css`:

```css
@theme inline { --color-primary: var(--primary); … }
:root                    { --primary: …; }   /* dark, the default */
:root[data-theme=light]  { --primary: …; }   /* light overrides */
```

Because Tailwind utilities resolve to CSS variables, flipping `data-theme` on
`<html>` swaps the entire palette with no re-styling and no re-render. A small
inline script in the root layout sets the attribute before first paint (stored
preference → OS preference → dark) so there is no flash of the wrong theme.

The dashboard adds a `.dash-scope` token layer for values that differ from the
marketing site.

---

## Internationalisation

Georgian is primary (`<html lang="ka">`), English is secondary.

No user-facing string is hardcoded in a component. Copy lives in
`lib/content/*.ts` as `Bilingual` objects:

```ts
{ ka: "პაკეტები", en: "Packages" }
```

and is resolved at render time with `t()` from `useLanguage()`. The active
locale is held in a context and persisted to `localStorage`; switching is
instant and client-side.

This is also why content is easy to hand to an admin panel later — every string
already lives in a data file rather than in JSX.

---

## SEO

Structured, not sprinkled:

- `lib/seo/site.ts` — canonical origin, site-wide constants, `absoluteUrl()`.
- `lib/seo/metadata.ts` — `pageMetadata()` builds title, description, canonical
  and Open Graph for a page in one call.
- `lib/seo/jsonld.ts` — Organization, WebSite, WebPage, AboutPage, ContactPage,
  SoftwareApplication, FAQPage and BreadcrumbList schemas.
- `app/opengraph-image.tsx` — the share card, generated at build time.
- `app/sitemap.ts`, `app/robots.ts` — the dashboard is excluded from both.
- `next.config.ts` — permanent redirect from `www.` to the bare domain, so a
  page never has two canonical hosts.

Most marketing pages are statically rendered (`○` in the build output). The
three that carry admin-editable content — home, pricing and contact — are
`force-dynamic` (`ƒ`) so an owner's edit shows up on the next request; they are
still fully server-rendered into HTML, so SEO is unaffected. The reason the
Content-Security-Policy uses `'unsafe-inline'` rather than per-request nonces is
to keep the *static* pages static — see the comment in `next.config.ts`.

---

## Security

| Concern | Where |
| --- | --- |
| Tenant isolation | `lib/session.ts` + `businessId` on every query |
| Role enforcement | `lib/auth/permissions.ts`, called by every action |
| Password storage | bcrypt cost 10 |
| Reset tokens | SHA-256 hashed, single-use, 60-minute expiry |
| Brute force | `lib/security/rateLimit.ts` — Postgres-backed |
| Transport + headers | `next.config.ts` — CSP, HSTS, frame, referrer, permissions |
| Input validation | Zod schemas in `lib/validation/` |
| Log hygiene | `lib/logger.ts` redacts password/token/secret/cookie/card keys |
| Error surface | `error.tsx` shows a short error id, never a stack trace |

The rate limiter stores attempts in Postgres rather than process memory
specifically because Vercel runs several serverless instances — an in-memory
counter resets on every cold start and can be dodged by spreading requests
across instances.

---

## Testing

`pnpm test` runs the Vitest suite (`lib/**/*.test.ts`, config in
`vitest.config.ts`). The focus is deliberate: the **security-critical logic**,
tested with no database so the suite runs anywhere and fast.

| Test file | Guards |
| --- | --- |
| `lib/auth/permissions.test.ts` | the role → permission matrix, exhaustively (every role × permission) + fail-closed on unknown roles |
| `lib/validation/auth.test.ts` | password rule and register/reset/forgot schemas |
| `lib/auth/passwordReset.test.ts` | token is hashed-at-rest, single-use, expiring, no enumeration |
| `lib/security/rateLimit.test.ts` | sliding-window arithmetic, dual budget, fail-open |
| `lib/dashboard/youtube.test.ts` | the YouTube-host allow-list (rejects look-alike/non-YouTube URLs) |
| `lib/logger.test.ts` | secret redaction across nested objects and arrays |

Database-touching modules are mocked (`vi.mock("@/lib/db")`), so a test can
drive the *logic* — e.g. "the window is full" — without a real Postgres. The one
thing unit tests can't prove this way is tenant isolation at the query level;
that remains hand-verified with live cross-tenant requests, and turning it into a
DB-backed integration test is the documented next step
([HANDOVER.md](HANDOVER.md#8-test-coverage-is-unit-level-not-yet-integration-level)).

Pure functions that were previously private (like `normalizeYouTubeUrl`) were
lifted into their own modules so they can be imported and tested directly — a
`"use server"` file can only export async actions, so helpers don't belong there
anyway.

---

## Deliberate boundaries

Four places are intentionally left as clean seams for work that is out of scope
for this build. Each is a single file, with the swap documented in its header:

| Seam | File | Currently | To go live |
| --- | --- | --- | --- |
| Email | `lib/mail/send.ts` | logs to console | implement `deliver()`, add provider key |
| AI replies | `lib/chat/bot.ts` | keyword matcher | replace `getBotReply` with an API call |
| Payments | `lib/payments/` | BOG + TBC wired | set the bank credentials |
| Channels | `Channel` rows + status | modelled, not connected | Meta/WhatsApp integration |

The channel integration was excluded from this engagement's scope. The database
and UI already model it, so adding it is additive rather than structural.

### Payments

`lib/payments/` holds one adapter per Georgian bank behind a shared
`PaymentAdapter` interface, and `lib/billing/checkout.ts` holds the money logic
that both share. A bank only appears as an option when its credentials are set,
so the platform can launch with one and add the other with no code change.

Two rules hold the design together:

1. **The price is never taken from the browser.** `amountFor()` recomputes it
   from the `Plan` row on every checkout, so a tampered form cannot change what
   is charged.
2. **A callback is a hint, not a fact.** Callbacks only identify *which* payment
   to re-check; the outcome always comes from an authenticated call back to the
   bank. BOG's callback is signature-verified on top of that; TBC does not sign
   at all, which is precisely why the body is never trusted.

`settlePayment()` is idempotent — it is called from both the bank's callback and
the customer's return page, and guards the transition with
`updateMany({ where: { status: "PENDING" } })`, so whichever arrives first wins
and a replayed callback cannot extend a subscription twice.

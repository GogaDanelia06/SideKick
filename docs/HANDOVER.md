# Handover notes

Everything the next owner of this codebase needs that is not obvious from
reading it.

---

## მოკლედ ქართულად

Sidekick არის Next.js 16 აპლიკაცია, რომელიც განთავსებულია Vercel-ზე, ბაზა კი —
Neon-ის Postgres-ზე. ორი ნაწილისგან შედგება: **საჯარო საიტი** (მთავარი, ჩვენ
შესახებ, ფასები, კონტაქტი, იურიდიული გვერდები) და **პირადი კაბინეტი**
(`/dashboard`), სადაც თითოეული კლიენტი მართავს თავის ბიზნესს.

**რა მუშაობს სრულად:** რეგისტრაცია, ავტორიზაცია, პაროლის აღდგენა, როლები და
უფლებები, ყველა dashboard-ის გვერდი რეალურ ბაზასთან, კლიენტების ერთმანეთისგან
სრული იზოლაცია, SEO, უსაფრთხოების ჰედერები და brute-force დაცვა.

გადახდა ორივე ქართულ ბანკთან (BOG და TBC) აშენებულია — აკლია მხოლოდ სავაჭრო
რეკვიზიტები. სანამ ისინი არ დაყენდება, ფასიანი პაკეტის ყიდვა შეუძლებელია.

**რა არის შეგნებულად დატოვებული:** ელფოსტის რეალური გაგზავნა (ერთი ფაილი),
რეალური AI პასუხები (ერთი ფაილი) და Facebook/Instagram/WhatsApp ინტეგრაციები —
ეს უკანასკნელი ხელშეკრულებით ამ ეტაპზე არ შედიოდა.

დეტალები ქვემოთ, ინგლისურად — რადგან კოდის კომენტარები და ცვლადების სახელები
ინგლისურადაა და ორ ენას შორის გადართვა შეცდომების წყაროა.

---

## Where things live

| Thing | Where |
| --- | --- |
| Source | `https://github.com/GogaDanelia06/SideKick` |
| Default branch | `main` |
| Deploy branch | `develop` (this is what Vercel builds — confirm before changing) |
| Hosting | Vercel |
| Database | Neon (serverless Postgres) |
| Domain | `sidekick.ge`, with `www.` redirecting to it |

---

## Access list

Fill this in at handover and store it somewhere the client controls — a password
manager, not a document. **Do not commit real credentials to this file.**

| System | Purpose | Owner account | Transferred? |
| --- | --- | --- | --- |
| GitHub | source code | | ☐ |
| Vercel | hosting, env vars, domains | | ☐ |
| Neon | production database | | ☐ |
| Domain registrar | `sidekick.ge` DNS | | ☐ |
| Google Search Console | SEO monitoring, sitemap | | ☐ |
| Google Cloud Console | OAuth client (if Google sign-in is enabled) | | ☐ |
| Email provider | transactional mail (once configured) | | ☐ |
| Bank of Georgia | merchant account + API credentials | | ☐ |
| TBC | merchant account + API credentials | | ☐ |

**Transfer checklist**

- [ ] Add the client as **Owner** on GitHub, Vercel and Neon, then remove the
      outgoing developer.
- [ ] Rotate `AUTH_SECRET` after the developer's access is removed. Everyone is
      signed out once; that is expected and is the point.
- [ ] Rotate the Neon database password.
- [ ] Rotate any provider API keys the developer had.
- [ ] Confirm the domain is in the client's registrar account, not the
      developer's.
- [ ] Confirm the client can deploy: make a trivial change and watch it ship.

---

## What is complete

- **Registration and sign-in** — bcrypt passwords, JWT sessions, optional Google
  provider.
- **Password recovery** — hashed single-use tokens, 60-minute expiry, no account
  enumeration, delivered by email.
- **Roles and permissions** — OWNER / ADMIN / OPERATOR / VIEWER enforced on the
  server for all 22 write actions. Verified by replaying the same crafted
  request under three different roles.
- **Multi-tenancy** — shared tables filtered by `businessId`, indexed. Verified
  with cross-tenant read *and* write attempts: both matched zero rows.
- **All twelve dashboard screens** on real database queries. No mock data
  remains anywhere in the dashboard.
- **Loading states** — `loading.tsx` skeletons on every dashboard route.
- **Error handling** — route, dashboard and global error boundaries; users see a
  short error id, the full stack goes to the logs.
- **Legal pages** — Terms, Privacy, Data Protection, drafted with the
  controller/processor distinction. Bracketed placeholders `【…】` must be filled
  with the company's real registration details before launch.
- **SEO** — per-page metadata, canonical URLs, Open Graph, generated share card,
  eight JSON-LD schema types, sitemap, robots, `www` redirect.
- **Security** — CSP, HSTS, frame/referrer/permissions headers, and Postgres-
  backed rate limiting on login, registration, and both reset endpoints.

---

## Known gaps and deliberate trade-offs

Ordered by how likely each is to matter.

### 1. Email — RESOLVED

`lib/mail/send.ts` sends through Resend. Password recovery and signup
confirmation both deliver.

Two things are worth knowing, because both cost a day to find once:

- **`MAIL_FROM` must sit on the verified sending domain**, which is
  `send.sidekick.ge`, not the root. Addressing the root is refused by Resend —
  and the refusal is quiet, because mail to the Resend account owner's own inbox
  still arrives. It looks like email works until a real customer tries it.
- **A refused send is logged, not surfaced.** For a registered address
  `/api/auth/forgot` answers `ok` whether or not the message left, so
  `password reset email could not be sent` in the logs is the only trace. An
  unregistered address is told so directly — see SECURITY-CHECKLIST 6.6 for why
  the old vague answer was dropped.

### 2. The chat widget is a keyword matcher, not AI

`lib/chat/bot.ts` matches keywords and returns canned bilingual replies. The
widget is labelled "AI აგენტი" in the UI. That wording should either change or
be backed by a real model before the product is sold on it.

*Fix:* replace `getBotReply` with a call to a language model. The UI already
handles both languages and needs no changes.

### 3. Landing-page statistics — RESOLVED

The homepage figures used to be invented placeholders (`1,200+`, `8,540`,
`2.4M₾`). They are now admin-editable rows in the `SiteStat` table, and the
homepage **hides the whole section when the table is empty** — a fresh install
ships no numbers at all rather than fake ones. The platform owner enters real
figures from **/admin → Stats**. Nothing to do unless you want to add figures.

### 4. Role changes need a re-login

The role is stored in the session JWT, so changing someone's role does not take
effect until they sign in again — up to 7 days.

*Fix:* look the role up per request in the `session` callback, accepting one
extra query per request; or shorten `maxAge`; or force a sign-out when
`updateMemberRole` runs.

### 5. CSP allows inline scripts

`script-src` includes `'unsafe-inline'`, which weakens the policy's XSS
protection. This was chosen so the marketing pages stay statically rendered — a
nonce has to be minted per request, which forces dynamic rendering and costs the
SEO and performance those pages depend on.

*Fix path, if it becomes a priority:* mint a nonce in `proxy.ts`, add
`'nonce-<value>'` to the policy, drop `'unsafe-inline'`, and thread the nonce
through the JSON-LD `<script>` tags in `components/seo/JsonLd.tsx`. Accept that
marketing pages become dynamic.

### 6. Weak passwords already in the database

At least two production accounts were created before the password rule existed
and use `123456`. The rule (8+ characters, letter and digit) applies to new
passwords only — it cannot retroactively fix stored ones.

*Fix:* force a reset for those accounts.

### 7. Channels — Facebook and Instagram are live; WhatsApp is not

Both Meta channels are connected end to end: OAuth from the channels page, a
signed webhook, AI replies delivered back to the customer. WhatsApp remains
modelled but unbuilt.

The two Meta channels are **separate products that happen to share a webhook**,
and treating them as one cost this project the better part of a week:

| | Facebook Messenger | Instagram |
| --- | --- | --- |
| Authorises | a Page, via Facebook Login | the Instagram account, via **Instagram Login** |
| App credentials | `META_APP_ID` / `META_APP_SECRET` | `INSTAGRAM_APP_ID` / `INSTAGRAM_APP_SECRET` — a different app |
| Token | Page token (`EAA…`) | Instagram token (`IGA…`) |
| Sends to | `graph.facebook.com` | `graph.instagram.com` |
| Scopes | `pages_messaging` | `instagram_business_manage_messages` |

Everything below is load-bearing; each one produced silence rather than an error
when it was wrong:

- **The webhook signature is checked against both app secrets.** Instagram signs
  with its own, so checking only Facebook's passed every Messenger delivery and
  rejected every Instagram one — which is indistinguishable from Meta sending
  nothing.
- **`entry[].id` is the Instagram *business account* id** (`17841…`), which is
  what `/me?fields=user_id` returns — not the app-scoped `id` from the same
  call. Storing the wrong one drops every message at the tenant lookup.
- **Those ids exceed 2^53**, so `JSON.parse` rounds them if they are read as
  numbers. They are handled as strings throughout.
- **Both envelopes are parsed** — `entry[].messaging[]` and
  `entry[].changes[]` — because Instagram Login can use either.
- **The account must be subscribed**, not just authorised. `connectInstagram`
  posts to `/me/subscribed_apps` and treats a failure as a failed connection,
  because an account that is linked but unsubscribed receives nothing.
- **The app must be subscribed too**, per object. `object: instagram` is a
  separate subscription from `object: page` in the App Dashboard; having one
  does not imply the other.

Instagram tokens expire after **60 days**. Nothing refreshes them yet — the
repair is the "Reconnect" button on the channels page, and a merchant will need
to be told to press it.

### 7a. Payments need bank credentials before they do anything

The payment module is built and covers both Georgian banks, but it stays inert
until credentials are set: with none configured the billing screen says payments
are not enabled and **no plan can be bought at all**. That is deliberate — there
is no code path that grants a paid plan without a bank confirming the money.

To go live, set `BOG_CLIENT_ID` / `BOG_CLIENT_SECRET` and/or `TBC_API_KEY` /
`TBC_CLIENT_ID` / `TBC_CLIENT_SECRET` (see `.env.example`). Each bank requires
its own merchant agreement, and **recurring billing — charging a saved card
without the customer present — is a separate product in both contracts.** The
code stores the saved-card reference the banks return, but automatic renewal is
not scheduled anywhere yet: today a customer renews by paying again. Whoever
adds a renewal job should charge through the same
`settlePayment()` path so the idempotency guarantee still holds.

### 8. Test coverage is unit-level, not yet integration-level

`pnpm test` runs 124 unit tests (Vitest) over the security-critical logic: the
permission matrix (exhaustively), input validation, the reset-token lifecycle,
the rate-limiter window arithmetic, the YouTube-host allow-list and log
redaction. They use no database, so they run anywhere and re-verify the logic on
every change.

What they do **not** cover is tenant isolation *at the query level* — that
guarantee ("every query filters by `businessId`") was verified by hand with live
cross-tenant requests, but proving it in code needs a real database with two
tenants in it.

*Fix:* add DB-backed integration tests against a disposable test database
(seed two businesses, assert one can never read or write the other's rows).
That is the one remaining layer.

### 9. Admin panel — site content is covered; tenant admin is not

The platform owner has an admin panel at **/admin** for editing public site
content: homepage stats, plan prices and limits, the marketing FAQ, and the
homepage SEO title/description. See [the Admin panel section](#admin-panel)
below.

What it does **not** yet include is tenant administration — there's no screen to
list every business, suspend one, or impersonate a user for support. That was
out of the agreed scope (site content + SEO). Doing it means adding screens that
read across tenants; the `isAdmin` gate and admin shell are already in place to
build on.

---

## Admin panel

A separate area from the tenant dashboard, for the person who owns the platform.

**Who can reach it.** Only a user with `isAdmin = true`. This flag is **not**
settable through the app — the only way to grant it is a script run by someone
with database access:

```bash
pnpm admin:grant someone@example.com          # grant
pnpm admin:grant someone@example.com --revoke  # revoke
```

The user must already have registered on the site. After granting, they sign out
and back in (or just visit `/admin`). Keeping this off the web UI means the most
powerful role has no attack surface in the app itself.

**How it's gated.** Two layers: `proxy.ts` redirects non-admins away at the
edge using a flag in the session token, and `requireAdmin()` re-checks against
the database on every admin page — so a revoked admin loses access on their next
request, not when their token eventually expires.

**What it manages** (all under `/admin`):

| Screen | Edits | Appears on |
| --- | --- | --- |
| Stats | homepage figures (bilingual) | homepage hero — hidden if empty |
| Plans | price, limits, featured flag, names | pricing page **and** billing (one source) |
| FAQ | marketing questions (bilingual, publishable) | contact page + FAQ rich-results |
| SEO | homepage title + meta description | `<title>` and `<meta description>` |

**How edits reach the site.** The affected marketing pages (home, pricing,
contact) render with `export const dynamic = "force-dynamic"` and read the
content from the database per request, so an edit shows up on the next page
view. There's no cache to clear. If marketing traffic ever grows enough to make
per-request reads matter, wrap the read helpers in `lib/site/content.ts` with
`unstable_cache` and call `revalidateTag` from the admin actions — the call
sites don't change.

**Plans are the single source of truth for prices.** The marketing pricing page
and billing both read the `Plan` table; editing a price or a limit in /admin
updates both at once. Plans can be edited but not added or removed, because
registration and billing reference them by fixed key.

---

## Routine maintenance

| Task | How often | Command / note |
| --- | --- | --- |
| Dependency updates | monthly | `pnpm outdated`, then `pnpm update` |
| Security advisories | monthly | `pnpm audit` |
| Neon backups | verify quarterly | Neon takes them automatically; test a restore |
| `RateLimitHit` table size | never, normally | swept automatically on ~2% of writes |
| Expired reset tokens | optional | `purgeExpiredResetTokens()` exists for a cron job |
| Instagram tokens | automatic, daily | `/api/cron/instagram-refresh` renews inside 15 days of expiry. Needs `CRON_SECRET`; without it the route answers 401 to everything, **including Vercel**, and the job silently never runs |
| Instagram refresh failures | watch monthly | grep the logs for `Instagram token could not be renewed`. Once a token lapses there is no repair but the **Reconnect** button on the channels page |
| Next.js major upgrades | as released | `next-auth` is on a **beta**; check its changelog first |

`next-auth@5.0.0-beta.31` is the one dependency worth watching. It is a beta;
its stable release may change the config shape. Pin it until you are ready to
migrate deliberately.

---

## Before handing this to the client

Everything here is a one-off, and every item has been true at some point during
development — which is exactly why it needs writing down rather than
remembering.

### Rotate every credential

All of these were shared over chat while the two teams were building, so treat
each as public:

`DATABASE_URL` (Neon role password) · `AUTH_SECRET` · `META_APP_SECRET` ·
`INSTAGRAM_APP_SECRET` · `META_VERIFY_TOKEN` · `AI_SERVICE_TOKEN` ·
`AI_SERVICE_KEY` · `RESEND_API_KEY` · `CRON_SECRET` · the bank credentials

Rotating `META_VERIFY_TOKEN` means retyping it in the App Dashboard; rotating an
app secret means the webhook stops until the new one is in Vercel. Do them in a
quiet hour, not on a Friday.

The **channel tokens in the database** (`Channel.accessToken`) are not rotated
by hand — press **Reconnect** on the channels page and Meta issues fresh ones.

### Switch off the debug flags

`DEBUG_WEBHOOK_BODY=1` traces every webhook delivery. It no longer prints
customer text — `lib/channels/webhookDebug.ts` replaces each human-written field
with its length — so leaving it on is a noise problem rather than a privacy one.
Still worth removing once whatever question it was turned on for is answered.

### Fill in the legal placeholders

The Terms, Privacy and Data Protection pages carry bracketed `【…】` markers where
the company's registration details go.

---

## Conventions worth keeping

These are not arbitrary — breaking them is how the properties above get lost.

1. **Every query takes `businessId`.** A query without it is a data leak.
2. **Every write action starts with `requirePermission()`.** Hiding a button is
   not a control.
3. **No user-facing string in a component.** Copy lives in `lib/content/*` as
   `{ ka, en }` and is resolved with `t()`. This is also what makes an admin
   panel feasible later.
4. **Env validation stays lazy.** `lib/env.ts` must not run at import time or
   the build breaks.
5. **Error codes, not messages.** Actions return `{ ok: false, error: "code" }`;
   the client translates. Database text never reaches the browser.
6. **Log through `lib/logger.ts`.** It redacts passwords, tokens and cookies
   automatically. `console.log` does not.

---

## Reading order for a new developer

1. [SETUP.md](SETUP.md) — get it running.
2. [ARCHITECTURE.md](ARCHITECTURE.md) — how it fits together.
3. `lib/session.ts` and `lib/auth/permissions.ts` — the two files that define
   who can see and do what. Everything else assumes them.
4. One dashboard screen end to end: `app/dashboard/videos/page.tsx` →
   `components/dashboard/videos/VideosView.tsx` → `createVideo` in
   `lib/dashboard/actions.ts`. It is small and shows every pattern in the
   codebase.
5. [API.md](API.md) when you need to add an endpoint.
6. [DEPLOYMENT.md](DEPLOYMENT.md) before you ship.
7. [DEPENDENCIES.md](DEPENDENCIES.md) (Annex 8) and
   [SECURITY-CHECKLIST.md](SECURITY-CHECKLIST.md) (Annex 9) — the contract
   annexes: the library register and the security audit.

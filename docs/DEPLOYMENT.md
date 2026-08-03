# Deployment

Sidekick deploys to **Vercel**, with **Neon** serverless Postgres as the
database. Nothing in the code is Vercel-specific except two assumptions noted
under [Hosting elsewhere](#hosting-elsewhere).

---

## Environment variables

Set these in **Vercel → Project → Settings → Environment Variables**, for all
three environments (Production, Preview, Development) unless noted.

### Required

| Variable | Example | Notes |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://…-pooler.neon.tech/…?sslmode=require` | **Pooled** connection string. Serverless functions open many short-lived connections; the pooler is what stops Postgres running out. |
| `AUTH_SECRET` | 32 random bytes, base64 | Signs the session JWT. Generate with `openssl rand -base64 32`. Changing it signs everyone out. |

### Recommended

| Variable | Example | Notes |
| --- | --- | --- |
| `DIRECT_URL` | `postgresql://…neon.tech/…?sslmode=require` | **Unpooled**. Prisma Migrate needs a direct connection; migrations fail or hang through a pooler. |
| `AUTH_URL` | `https://sidekick.ge` | The canonical origin. Auth.js infers it on Vercel, but setting it explicitly avoids callback URLs pointing at a preview domain. |
| `NEXT_PUBLIC_SITE_URL` | `https://sidekick.ge` | Used for canonical tags, sitemap and Open Graph. Defaults to `https://sidekick.ge` (see `lib/seo/site.ts`). |

### Optional

| Variable | Enables |
| --- | --- |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | The "Sign in with Google" button. Without them the provider is not registered and the button does nothing useful. |
| `RESEND_API_KEY` | Real email delivery — but only after `deliver()` is implemented. See [Email](#email). |
| `MAIL_FROM` | Sender address. Defaults to `Sidekick <noreply@sidekick.ge>`. |
| `AI_SERVICE_TOKEN` | The `/api/agent/*` endpoints the AI service writes through. 32+ characters; generate with `openssl rand -hex 32`. Unset means the whole surface answers `503`, which is right for an environment the AI service is not pointed at. Rotating it is one variable change — tell the AI team before you do. See [AGENT-API.md](AGENT-API.md). |

Validation lives in `lib/env.ts` and runs **lazily**, at request time. This is
deliberate: `next build` imports every route to collect page data, so eager
validation would fail the whole build on a machine with no runtime secrets. It
has broken the Vercel build once already — keep it lazy.

---

## First deploy

1. **Create the Neon database.** Copy both connection strings from the Neon
   dashboard: the pooled one (host contains `-pooler`) for `DATABASE_URL`, and
   the direct one for `DIRECT_URL`.

2. **Import the GitHub repository into Vercel.** Framework preset: Next.js.
   Everything else can stay on defaults.

3. **Add the environment variables** from the table above.

4. **Set the build command** so migrations run before the build:

   ```
   prisma migrate deploy && next build
   ```

   Without this, a deploy that adds a table will ship code expecting a table
   the database does not have. See [Migrations](#migrations).

5. **Deploy**, then seed the reference data once:

   ```bash
   DATABASE_URL="<production pooled url>" pnpm db:seed:prod
   ```

   This loads the three subscription plans and the starter marketing FAQ.
   Registration attaches a plan to every new business, so the app does not work
   correctly without it. The seed is idempotent, creates no demo tenant, and
   leaves `SiteStat` empty on purpose (no invented homepage numbers).

6. **Grant the platform admin.** Have the site owner register a normal account,
   then promote it:

   ```bash
   DATABASE_URL="<production pooled url>" pnpm admin:grant owner@example.com
   ```

   They can now reach **/admin** to edit stats, plan prices, the FAQ and SEO
   text. This is the only way to create an admin — it is deliberately not in the
   web UI. See [HANDOVER.md](HANDOVER.md#admin-panel).

7. **Point the domain** at the project. `next.config.ts` already redirects
   `www.sidekick.ge` to `sidekick.ge` permanently, so add both to Vercel and let
   the redirect handle canonicalisation.

7. **Verify.** Walk [the checklist](#post-deploy-checklist) below.

---

## Migrations

`prisma migrate deploy` applies any migration files that the database has not
seen. It never generates new ones and never resets anything — it is the correct
command for production.

**The build command must include it.** If it is not there, someone has to
remember to run migrations by hand on every schema change, and eventually will
not. Symptom: a page 500s with a Prisma error naming a column that exists in the
schema but not in the database.

Creating a migration locally:

```bash
# edit prisma/schema/*.prisma
pnpm db:migrate --name describe_the_change
git add prisma/schema/migrations
```

Migration files are committed to the repository. Never edit one after it has run
anywhere — write a new migration instead.

Applying by hand if the build command was not set:

```bash
DATABASE_URL="<direct url>" npx prisma migrate deploy
```

Use the **direct** URL, not the pooled one.

---

## Email

`lib/mail/send.ts` currently logs messages to the server console instead of
sending them. The password-reset flow is otherwise complete and working — the
link is generated, hashed, stored and validated correctly; it just is not
delivered.

**To go live:**

1. Create an account with a provider (the file has a worked Resend example) and
   verify the sending domain — DKIM and SPF records on `sidekick.ge`. Without a
   verified domain, reset emails land in spam.
2. Add `RESEND_API_KEY` and `MAIL_FROM` to Vercel.
3. Implement `deliver()` in `lib/mail/send.ts`. The commented example is
   complete; it needs to be uncommented and the placeholder `console.warn`
   removed.

Nothing else changes — every caller already goes through `sendMail()`.

---

## Post-deploy checklist

| Check | Expected |
| --- | --- |
| `https://sidekick.ge` | homepage renders, Georgian |
| `https://www.sidekick.ge` | 301 to the bare domain |
| `/dashboard` signed out | redirects to `/login` |
| Register a test account | succeeds, dashboard shows the new business |
| `curl -I https://sidekick.ge` | `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options: DENY` present |
| Browser console on `/` and `/dashboard` | no CSP violations |
| `/sitemap.xml` | lists marketing pages, excludes `/dashboard` |
| `/robots.txt` | disallows `/dashboard` and `/api` |
| Rich Results Test on `/`, `/pricing`, `/contact` | Organization, SoftwareApplication, FAQPage detected |
| Six failed logins in a row | sixth shows the lockout message, not "wrong password" |
| Delete the test account | database back to real data only |

---

## Rollback

Vercel keeps every previous deployment. **Deployments → ⋯ → Promote to
Production** on the last good one reverts the code in seconds.

Note that this does **not** roll back the database. A deploy that ran a
destructive migration cannot be undone by promoting an older build — restore
from a Neon branch or point-in-time restore instead. Prefer additive migrations
(add a nullable column, backfill, then drop the old one in a later release) so
that code rollback alone is always safe.

---

## Hosting elsewhere

Two Vercel assumptions to change if the app moves:

1. **`clientIp()` in `lib/security/rateLimit.ts`** trusts the first entry of
   `x-forwarded-for`. That is only safe behind a proxy that overwrites the
   header, which Vercel does. On a directly-exposed server a client can forge
   it and bypass IP-based limits.

2. **`prisma migrate deploy` in the build command** — the equivalent hook on
   another platform (a release phase, an init container, a CI step) has to run
   it instead.

Otherwise the app is a standard Next.js server: `pnpm build && pnpm start`
behind any reverse proxy, with `DATABASE_URL` pointing anywhere Postgres 16 is
reachable.

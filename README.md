# Sidekick

Multi-tenant SaaS for Georgian businesses: an AI assistant that answers
customers across channels, collects leads and tracks sales, with a full
management dashboard. Bilingual (ქართული / English), dark + light themes.

Next.js 16 · React 19 · TypeScript strict · Prisma 6 · PostgreSQL · Auth.js

---

## Documentation

| Document | Read it when |
| --- | --- |
| [docs/SETUP.md](docs/SETUP.md) | getting the project running on a new machine |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | you need to understand how it fits together |
| [docs/API.md](docs/API.md) | adding or calling an endpoint or Server Action |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | shipping to production |
| [docs/HANDOVER.md](docs/HANDOVER.md) | taking ownership — access, gaps, trade-offs |
| [docs/DEPENDENCIES.md](docs/DEPENDENCIES.md) | Annex 8 — every library, version and licence |
| [docs/SECURITY-CHECKLIST.md](docs/SECURITY-CHECKLIST.md) | Annex 9 — security controls, mapped to code |

New here? [SETUP.md](docs/SETUP.md), then
[ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Quick start

```bash
pnpm install
docker compose up -d          # local Postgres 16
# create .env with DATABASE_URL, AUTH_SECRET, AUTH_URL — see docs/SETUP.md
pnpm db:migrate
pnpm db:seed:prod             # subscription plans — required
pnpm dev                      # http://localhost:3000
```

Full instructions, including every environment variable, are in
[docs/SETUP.md](docs/SETUP.md).

---

## Layout

```
app/
  (marketing)/     public pages — home, about, pricing, contact, legal
  (auth)/          login, register, forgot, reset
  dashboard/       authenticated tenant area, one folder per screen
  admin/           platform-owner content editors (stats, plans, faq, seo)
  api/auth/        register, forgot, reset + the Auth.js catch-all
components/        ui primitives, layout, marketing sections, dashboard screens
lib/
  session.ts       the tenant boundary — getContext / requireContext
  auth/            permission matrix, password-reset tokens
  security/        rate limiting
  dashboard/       queries (reads) and actions (writes)
  content/         all copy, bilingual
  seo/             metadata builders and JSON-LD schemas
prisma/schema/     multi-file schema + migrations
```

---

## The rules that matter

1. Every query takes `businessId`. One without it is a data leak.
2. Every write action starts with `requirePermission()`.
3. No user-facing string lives in a component — copy goes in `lib/content/*`.
4. Environment validation stays lazy (`lib/env.ts`), or the build breaks.

The reasoning behind each is in
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Commands

```bash
pnpm dev / build / start / lint
pnpm test             # run the unit test suite (Vitest)
pnpm test:watch       # re-run on change

pnpm db:migrate       # create + apply a migration
pnpm db:studio        # browse the database
pnpm db:seed:prod     # plans + FAQ — safe anywhere
pnpm db:seed          # demo tenant — local only

pnpm admin:grant <email>   # make a registered user a platform admin (/admin)
```

## Tests

`pnpm test` runs 124 unit tests over the security-critical logic — the
permission matrix, input validation, password-reset tokens, the rate-limiter
window and log redaction. No database required; they run anywhere.

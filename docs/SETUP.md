# Setup guide

Getting a working Sidekick on a new machine. Target: from a clean checkout to a
running app in about ten minutes.

---

## 1. Prerequisites

| Tool | Version | Check |
| --- | --- | --- |
| Node.js | 20 LTS or newer | `node -v` |
| pnpm | 10.15.0 (pinned in `package.json`) | `pnpm -v` |
| PostgreSQL | 16 | `psql --version` |
| Git | any recent | `git --version` |

pnpm is the required package manager — `packageManager` is pinned, and
`pnpm-lock.yaml` is the only lockfile in the repo. Installing with npm or yarn
will produce a different dependency tree.

```bash
npm install -g pnpm@10.15.0
```

Postgres can be a local install or the bundled Docker service (step 3).

---

## 2. Clone and install

```bash
git clone https://github.com/GogaDanelia06/SideKick.git
cd SideKick
pnpm install
```

`pnpm install` runs `prisma generate` automatically (the `postinstall` script),
so the Prisma client is built before you touch anything.

---

## 3. Database

**Option A — Docker (recommended for a new machine).**

```bash
docker compose up -d
```

This starts Postgres 16 on port 5432 with database `sidekick_dev` and user
`goga`, no password. Stop any native Postgres on 5432 first or the port will
clash. `docker compose down -v` stops it and wipes the data volume.

**Option B — an existing Postgres.** Create the database and adjust
`DATABASE_URL` in step 4:

```bash
createdb sidekick_dev
```

---

## 4. Environment variables

Create `.env` in the project root:

```bash
DATABASE_URL="postgresql://goga@localhost:5432/sidekick_dev"
AUTH_SECRET="<paste output of: openssl rand -base64 32>"
AUTH_URL="http://localhost:3000"
```

Generate the secret:

```bash
openssl rand -base64 32
```

Full variable reference, including the optional ones, is in
[DEPLOYMENT.md](DEPLOYMENT.md#environment-variables).

`.env` is git-ignored and must stay that way. Never commit real secrets.

---

## 5. Apply the schema

```bash
pnpm db:migrate     # applies every migration in prisma/schema/migrations
pnpm db:seed:prod   # loads the three subscription plans — required
```

`db:seed:prod` loads reference data only (the Basic/Standard/Premium plans).
Registration attaches a plan to each new business, so **the app will not work
correctly without it**. It is idempotent — safe to re-run.

`pnpm db:seed` additionally creates a demo tenant with fake products, orders and
conversations. Useful for looking at a populated UI locally; never run it
against a customer database.

---

## 6. Run

```bash
pnpm dev        # http://localhost:3000
```

Create an account at `/register`. The first user of a business becomes its
`OWNER`; registration also provisions the business, its AI config, its four
channel rows and a trial subscription — see `lib/provision.ts`.

---

## 7. Verify the install

| Check | Expected |
| --- | --- |
| `http://localhost:3000` | Georgian marketing homepage |
| `http://localhost:3000/dashboard` while signed out | redirect to `/login` |
| Register, then `/dashboard` | dashboard with your business name |
| `pnpm build` | completes with no errors |
| `pnpm lint` | clean |
| `pnpm test` | 124 tests pass |

---

## Everyday commands

```bash
pnpm dev              # dev server (runs prisma generate first)
pnpm build            # production build
pnpm start            # serve the production build
pnpm lint             # eslint
pnpm test             # unit tests (Vitest); pnpm test:watch to re-run on change

pnpm db:migrate       # create + apply a migration after editing the schema
pnpm db:generate      # regenerate the Prisma client only
pnpm db:studio        # browse the database in a GUI
pnpm db:seed          # demo data (local only)
pnpm db:seed:prod     # plans + starter FAQ (safe anywhere)
pnpm db:reset         # DROP everything and re-migrate — local only

pnpm admin:grant <email>   # promote a registered user to platform admin (/admin)
```

---

## Troubleshooting

**`Could not find Prisma Schema`**
The schema is split across `prisma/schema/*.prisma`, and the folder is declared
in `package.json` under `"prisma": { "schema": "prisma/schema" }`. If a tool
can't find it, that key is missing or you are running from the wrong directory.

**`Invalid environment variables` during build**
Validation in `lib/env.ts` is deliberately lazy — it runs at request time, not
import time, because `next build` imports every route and would otherwise fail
on a machine with no runtime secrets. If you see this at build time, something
started calling `env()` at module scope. Move the call inside a function.

**Port 5432 already in use**
A native Postgres is running. Stop it (`brew services stop postgresql@16`) or
change the published port in `docker-compose.yml` and in `DATABASE_URL`.

**Login says the credentials are wrong when they aren't**
Failed sign-ins are rate limited: 5 per address per 15 minutes. The form shows a
distinct "too many attempts" message when that is the cause. Clear it locally
with `DELETE FROM "RateLimitHit";` or wait out the window.

**Passwords in the database that are not bcrypt hashes**
A row whose `passwordHash` is plain text can never sign in — `bcrypt.compare`
will always fail. Reset it through `/forgot`, or hash a new one manually.

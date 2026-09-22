# Annex 8 — Dependency register

Every third-party library the project depends on directly: its version, its
licence, what it is for, and the risk notes that matter at handover.

- **Generated:** 2026-09-22, against `pnpm-lock.yaml` at that date.
- **Runtime:** Node.js 24 LTS (`engines` in `package.json`, which Vercel follows), pnpm 10.34.5.
- **Security audit:** `pnpm audit` → **no known vulnerabilities** (with the one override below).
  Reproduce with `pnpm audit`, `pnpm licenses list` and `pnpm outdated`.
- **Direct dependencies:** 12 runtime + 12 tooling. **Full resolved tree:** 426 packages.

**Licences.** There is no strong-copyleft (GPL/AGPL) package; nearly everything is MIT,
ISC, Apache-2.0 or BSD. Four libraries carry a weak-copyleft licence, all used
unmodified as separate libraries: the libvips binary behind `sharp` (LGPL-3.0-or-later,
image processing), `lightningcss` and its platform binary (MPL-2.0, Tailwind's CSS
build) and `axe-core` (MPL-2.0, lint checks in development only). Weak copyleft asks
only that changes to those libraries themselves be shared. If a buyer needs a formal
licence opinion, have a lawyer confirm.

## Runtime dependencies — shipped to production

| Package | Version | Licence | Purpose | Notes |
| --- | --- | --- | --- | --- |
| `next` | 16.3.5 | MIT | The framework — routing, rendering, build, server | Core. Pinned; see [update policy](#update-policy). |
| `react` | 19.3.0 | MIT | UI runtime | Pinned; moves together with `react-dom`. |
| `react-dom` | 19.3.0 | MIT | React DOM renderer | Must match `react` exactly. |
| `next-auth` | 5.0.0-beta.32 | ISC | Authentication (sessions, providers, callbacks) | **Beta**. See [risk](#elevated-risk-next-auth). |
| `@auth/prisma-adapter` | 2.11.3 | ISC | Stores Auth.js users/accounts via Prisma | Pinned; keep aligned with `next-auth`. |
| `@prisma/client` | 6.19.3 | Apache-2.0 | Type-safe database client (generated) | Pinned; equals the `prisma` CLI. |
| `bcryptjs` | 3.0.3 | BSD-3-Clause | Password hashing (cost 10) | Pure JS; ships its own types. |
| `zod` | 4.6.5 | MIT | Runtime input validation | Every request body and env var. |
| `@vercel/blob` | 2.8.0 | Apache-2.0 | Storage for admin media uploads | |
| `@tabler/icons-react` | 3.47.0 | MIT | Icon set | Tree-shaken; only imported icons ship. |
| `fflate` | 0.8.3 | MIT | Zip for the product Excel import/export | Pure JS. |
| `clsx` | 2.1.1 | MIT | Conditional className joining | |

## Tooling dependencies — build, type-check, lint and tests only; not shipped

| Package | Version | Licence | Purpose |
| --- | --- | --- | --- |
| `prisma` | 6.19.3 | Apache-2.0 | Migrations + client generation CLI |
| `typescript` | 6.0.3 | Apache-2.0 | Type checker |
| `tailwindcss`, `@tailwindcss/postcss` | 4.3.3 | MIT | CSS engine and its PostCSS plugin |
| `eslint` | 10.11.0 | MIT | Linter |
| `eslint-config-next` | 16.3.5 | MIT | Next.js lint rules; same version as `next` |
| `@eslint/compat` | 2.1.1 | Apache-2.0 | Runs the older plugins inside `eslint-config-next` on ESLint 10 |
| `vitest` | 5.0.1 | MIT | Unit tests |
| `tsx` | 4.23.15 | MIT | Runs the TS seed scripts |
| `@types/node` | 24.13.6 | MIT | Node type definitions; follows the Node major |
| `@types/react`, `@types/react-dom` | 19.3.0 | MIT | React type definitions |

## Dependency override

One patched transitive package, forced by pnpm `overrides` (`pnpmOverridesNote` points here).

| Override | Forces | Fixes | Remove when |
| --- | --- | --- | --- |
| `deepmerge-ts` | `^8.0.2` | GHSA-ggr8-5vv4-36mx: a crafted self-referencing object crashes `deepmerge()` | `@prisma/config` depends on 8.x itself |

Prisma's config loader pins 7.1.5 (in 6.19 and 7.10 alike) and calls only the plain
`deepmerge()`, which 8.0 left unchanged; it runs in the Prisma CLI, never on a request.
Checked with `prisma validate` and `prisma migrate status`; recheck with
`npm view @prisma/config@latest dependencies.deepmerge-ts`.

The earlier `sharp` and `postcss` overrides are gone: Next 16.3.5 ships the patched
versions itself (`sharp ^0.35.4`, `postcss 8.5.23`).

**ESLint 10.** ESLint 9 reached end of life on 2026-08-06. `eslint-plugin-react`, `-import`
and `-jsx-a11y` (inside `eslint-config-next`) still declare ESLint 9 at most and call
functions ESLint 10 removed, so `eslint.config.mjs` wraps them with `@eslint/compat`, and
`pnpm.peerDependencyRules` accepts ESLint 10 for those three. Verified with a file of
deliberate mistakes: every plugin still reports. Drop both once the plugins support 10.

## Held back on purpose

Checked on 2026-09-22; revisit monthly with `pnpm outdated`.

| Package | Stays on | Newest | Why |
| --- | --- | --- | --- |
| `prisma`, `@prisma/client` | 6.19.3 | 7.10.0 | Major: new client generator and database driver. Planned as its own step with a full auth test. (8.0 is still a release candidate.) |
| `typescript` | 6.0.3 | 7.x | `typescript-eslint` supports TypeScript below 6.1; `next build` could use 7, linting could not. |
| `@types/node` | 24.x | 26.x | Follows the Node runtime, 24 LTS. |
| pnpm | 10.34.5 | 12.x | Its majors change the lockfile, and Vercel picks pnpm by lockfile version. |

## Update policy

**Pinned exactly, update deliberately:** `next`, `react` + `react-dom`, `next-auth`,
`@auth/prisma-adapter`, `@prisma/client` + `prisma`. They form tightly coupled pairs;
a mismatch inside a pair breaks rendering, auth or the database client.

- `react` / `react-dom` — always the same version as each other.
- `@prisma/client` — always the same version as the `prisma` CLI, or generation fails.
- `next-auth` / `@auth/prisma-adapter` — keep their shared `@auth/core` aligned.

**Routine:** monthly, run `pnpm outdated` and `pnpm audit`, then `pnpm update` for
patch and minor bumps. Rebuild and smoke-test auth afterwards (register → login →
dashboard → reset), because that is the flow most sensitive to these packages.

**Major bumps** (a leading version digit changes) get their own changelog read and
their own test pass, and are never folded into an unrelated change.

**Node.js** follows the active LTS line. It is set once, in `package.json` → `engines`,
which Vercel reads; the local machine should run the same major.

## Elevated risk: next-auth

`next-auth@5.0.0-beta.32` is a **beta**, and still the newest release on 2026-09-22.
It is the correct choice — v5 is what supports the App Router and the edge-safe split
config this project relies on — but two consequences follow:

1. **The API can still change** before the stable v5 release. Read the changelog
   before upgrading; it is pinned exactly so that `pnpm update` never moves it.
2. **Security fixes arrive as new betas.** The jump from beta.31 to beta.32 closed
   three critical and several lower advisories. Watch `npm view next-auth dist-tags`.

When stable v5 ships, migrate deliberately on its own branch and re-run the full
auth test pass. Everything else in the tree is a stable release with no current advisory.

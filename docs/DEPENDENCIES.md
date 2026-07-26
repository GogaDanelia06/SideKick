# Annex 8 — Dependency register

Every third-party library the project depends on directly: its version, its
licence, what it is for, and the risk notes that matter at handover.

- **Generated:** 2026-07-26, against `pnpm-lock.yaml` at that date.
- **Runtime:** Node.js 20 LTS, pnpm 10.15.0.
- **Security audit:** `pnpm audit --prod` → **no known vulnerabilities.**
- **Direct dependencies:** 11 runtime + 11 tooling.
- **Full resolved tree:** 426 packages (direct + transitive).

Every licence in the tree is permissive (MIT / ISC / Apache-2.0 / BSD /
0BSD / CC0). There is no copyleft (GPL/LGPL/AGPL) dependency, so the product
can be sold and distributed as closed source without a licence conflict.

To reproduce these findings:

```bash
pnpm audit --prod          # vulnerabilities
pnpm licenses list         # licence of every package in the tree
pnpm outdated              # which direct deps have newer releases
```

---

## Runtime dependencies

Shipped to production. These run in the deployed app.

| Package | Version | Licence | Purpose | Notes |
| --- | --- | --- | --- | --- |
| `next` | 16.2.11 | MIT | The framework — routing, rendering, build, server | Core. Patch-pinned; see [update policy](#update-policy). |
| `react` | 19.2.4 | MIT | UI runtime | Moves in lockstep with `react-dom` and `next`. |
| `react-dom` | 19.2.4 | MIT | React DOM renderer | Must match `react` exactly. |
| `next-auth` | 5.0.0-beta.32 | ISC | Authentication (sessions, providers, callbacks) | **Beta** — the one dependency to watch. See [risk](#elevated-risk-next-auth). |
| `@auth/prisma-adapter` | 2.11.3 | ISC | Persists Auth.js users/accounts/sessions via Prisma | Pulls `@auth/core`; keep aligned with `next-auth`. |
| `@prisma/client` | 6.19.3 | Apache-2.0 | Type-safe database client (generated) | Version must equal the `prisma` CLI. |
| `bcryptjs` | 3.0.3 | BSD-3-Clause | Password hashing (cost 10) | Pure JS, no native build. |
| `zod` | 4.4.3 | MIT | Runtime input validation | Every request body and env var is parsed through it. |
| `@tabler/icons-react` | 3.44.0 | MIT | Icon set | Tree-shaken; only imported icons ship. |
| `framer-motion` | 12.42.2 | MIT | Animation (hero carousel, chat widget) | Marketing-side only. |
| `clsx` | 2.1.1 | MIT | Conditional className joining | Tiny, ubiquitous, stable. |

## Tooling dependencies

Build, type-check and lint only. **Not shipped** — they never reach the
production bundle, so their advisories are lower-impact (they would need a
malicious package to run at build time, not at runtime).

| Package | Version | Licence | Purpose |
| --- | --- | --- | --- |
| `prisma` | 6.19.3 | Apache-2.0 | Migrations + client generation CLI |
| `typescript` | 5.9.3 | Apache-2.0 | Type checker |
| `tailwindcss` | 4.3.2 | MIT | CSS engine |
| `@tailwindcss/postcss` | 4.3.2 | MIT | Tailwind's PostCSS plugin |
| `eslint` | 9.39.5 | MIT | Linter |
| `eslint-config-next` | 16.2.10 | MIT | Next.js lint rules |
| `tsx` | 4.23.1 | MIT | Runs the TS seed scripts |
| `@types/node` | 20.19.43 | MIT | Node type definitions |
| `@types/react` | 19.2.17 | MIT | React type definitions |
| `@types/react-dom` | 19.2.3 | MIT | React DOM type definitions |
| `@types/bcryptjs` | 3.0.0 | MIT | bcryptjs type definitions |

---

## Dependency overrides

`package.json` pins two transitive packages to patched versions with a pnpm
`overrides` block. Both are build-time dependencies that `next@16.2.11` still
declares at a vulnerable version even in its own patched release:

| Override | Forces | Fixes | Remove when |
| --- | --- | --- | --- |
| `sharp` | `>=0.35.3` | libvips CVE in image processing | Next declares `sharp >=0.35.0` itself |
| `postcss@<8.5.18` | `>=8.5.18` | path traversal + XSS in CSS/source-map handling | Next declares `postcss >=8.5.18` itself |

Both stay within the same major version, so the bump is API-compatible. They
were verified by a full production build (the `sharp` bump exercises the
`/opengraph-image` route) and are the reason `pnpm audit` reports clean. A note
in `package.json` (`pnpmOverridesNote`) points back here.

Check periodically whether they are still needed:

```bash
npm view next@latest dependencies.postcss
npm view next@latest optionalDependencies.sharp
```

When Next ships the patched versions itself, delete the matching override and
re-run `pnpm install && pnpm audit --prod`.

---

## Update policy

**Pinned exactly, update deliberately:** `next`, `next-auth`,
`@auth/prisma-adapter`, `@prisma/client` + `prisma`. These four form two tightly
coupled pairs; a mismatch inside a pair breaks auth or the database client.

- `react` / `react-dom` — always the same version as each other.
- `@prisma/client` — always the same version as the `prisma` CLI, or generation
  fails.
- `next-auth` / `@auth/prisma-adapter` — keep their shared `@auth/core` aligned.

**Routine:** monthly, run `pnpm outdated` and `pnpm audit`, then `pnpm update`
for patch and minor bumps. Rebuild and smoke-test auth afterwards
(register → login → dashboard → reset), because that is the flow most sensitive
to these packages.

**Major bumps** (a leading version digit changes) get their own branch, their
own changelog read, and their own test pass. Never fold one into an unrelated
change.

---

## Elevated risk: next-auth

`next-auth@5.0.0-beta.32` is a **beta**. It is the correct choice — v5 is what
supports the App Router and the edge-safe split config this project relies on —
but two consequences follow:

1. **The API can still change** before the stable v5 release. Read the changelog
   before upgrading; do not let `pnpm update` move it automatically. It is
   pinned exactly for this reason.
2. **Security fixes arrive as new betas.** The jump from beta.31 to beta.32 in
   this project's history closed three critical and several lower advisories.
   Watch its releases specifically.

When stable v5 ships, migrate deliberately on its own branch and re-run the full
auth test pass.

Everything else in the tree is a stable release on a permissive licence with no
current advisory.

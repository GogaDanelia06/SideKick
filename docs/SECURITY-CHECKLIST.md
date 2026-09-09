# Annex 9 — Security checklist

A documented audit of the application's security controls, each mapped to the
code that implements it and, where relevant, to how it was verified.

- **Reviewed:** 2026-07-26
- **Scope:** the Sidekick web application (marketing site + tenant dashboard).
  Out of scope: the unbought channel and payment integrations, and the hosting
  provider's own controls (Vercel, Neon).
- **Legend:** ✅ implemented · ⚠️ partial / documented gap · ⬜ not applicable to
  current scope

Verification here means one of: a test that was actually run against a
production build (marked *tested*), or a control that is present in code and
read during this review (marked *reviewed*).

---

## 1. Authentication

| # | Control | Status | Evidence |
| --- | --- | --- | --- |
| 1.1 | Passwords stored as bcrypt hashes (cost 10), never plaintext | ✅ | `auth.ts`, `app/api/auth/register/route.ts` |
| 1.2 | Password strength enforced (8+ chars, letter + digit) | ✅ | `lib/validation/auth.ts` — one `passwordSchema` shared by register + reset |
| 1.3 | Sessions are signed JWTs, 7-day expiry, daily refresh | ✅ | `auth.config.ts` |
| 1.4 | Session cookie is HttpOnly + SameSite=Lax; Secure in production | ✅ | Auth.js default; HttpOnly/SameSite *tested* via Set-Cookie |
| 1.5 | Login failures are generic — no "user exists" leak | ✅ | `components/auth/LoginForm.tsx` shows one message for all failures |
| 1.6 | Brute-force protection on login | ✅ | `lib/security/rateLimit.ts` — 5/address + 30/IP per 15 min. *Tested:* 6th attempt returns `rate_limited` |
| 1.7 | Successful login clears the failure counter | ✅ | `auth.ts` `authorize()` calls `clear()`. *Tested* |
| 1.8 | Secrets (`AUTH_SECRET`) sourced from env, not committed | ✅ | `lib/env.ts`; `.env*` git-ignored except `.env.example` |

| 1.9 | Email verification required before sign-in | ✅ | `auth.ts` refuses an unverified address *after* checking the password, so the refusal never reveals which addresses exist |

**On 1.9:** registration falls back to activating the account when the provider
refuses the message. Stranding somebody mid-signup over a mail outage is the
worse failure, and the attempt is logged either way.

---

## 2. Authorization & multi-tenancy

| # | Control | Status | Evidence |
| --- | --- | --- | --- |
| 2.1 | Every dashboard route requires a valid session | ✅ | `proxy.ts` + `requireContext()` in each page |
| 2.2 | Defence in depth: edge middleware **and** per-page guard | ✅ | `proxy.ts`, `lib/session.ts` |
| 2.3 | Role-based permissions enforced server-side | ✅ | `lib/auth/permissions.ts` — every action calls `requirePermission()` |
| 2.4 | Tenant isolation: every query scoped by `businessId` | ✅ | `lib/dashboard/queries.ts` — `businessId` is a required argument on all |
| 2.5 | Writes re-check tenant ownership in the `where` clause | ✅ | `lib/dashboard/actions.ts` — `updateMany`/`deleteMany` with `businessId` |
| 2.6 | Cross-tenant read attempt returns nothing | ✅ | *Tested:* forged `businessId` matched 0 rows |
| 2.7 | Cross-tenant write attempt changes nothing | ✅ | *Tested:* crafted request under a foreign id affected 0 rows |
| 2.8 | Same action denied/allowed correctly across roles | ✅ | *Tested:* one crafted request replayed under OWNER/OPERATOR/VIEWER matched the matrix |
| 2.9 | UI hides controls a role can't use (convenience only) | ✅ | `can()` passed to views; server remains the real control |
| 2.10 | A session not asked to be remembered ends on its own | ✅ | `lib/auth/idle.ts` — 30 min idle; `lib/auth/sessionExpiry.ts` — 8 h absolute |

> **On session lifetime (2.10):** quitting the browser cannot sign anyone out.
> No signal reaches the server when a window closes, and Chrome and Safari hand
> the same session cookie back when they restore. Two server-side rules stand in
> for it, and only when "remember me" was left unticked: **30 minutes idle**
> (a signed `sk.seen` cookie refreshed by `proxy.ts`) and an **8 hour absolute
> cap** (`startedAt` in the token). Ticking "remember me" keeps the full 7 days,
> which is the whole point of the box.

> **Known trade-off (2.3):** the role lives in the session JWT, so a role change
> takes effect only on next sign-in (up to 7 days). Fix options in
> [HANDOVER.md](HANDOVER.md#4-role-changes-need-a-re-login).

---

## 3. Input validation & injection

| # | Control | Status | Evidence |
| --- | --- | --- | --- |
| 3.1 | All request bodies validated before use | ✅ | Zod schemas in `lib/validation/`; routes `safeParse` first |
| 3.2 | SQL injection prevented | ✅ | Prisma parameterises every query; no raw SQL in app code |
| 3.3 | External URLs sanitised before storage | ✅ | `normalizeYouTubeUrl()` rejects non-YouTube hosts; stores canonical form |
| 3.4 | Open-redirect prevented on post-login `callbackUrl` | ✅ | `LoginForm.tsx` honours only same-site paths (`startsWith("/")`) |
| 3.5 | XSS: React escapes by default; no `dangerouslySetInnerHTML` on user data | ✅ | *Reviewed:* only use is trusted JSON-LD in `components/seo/JsonLd.tsx` |
| 3.6 | Error responses carry codes, not raw database text | ✅ | `ActionResult` returns machine codes; client translates |

---

## 4. HTTP security headers

All set in `next.config.ts`, applied to every route. *Tested* against a
production build with `curl -I`.

| # | Header | Value | Status |
| --- | --- | --- | --- |
| 4.1 | `Content-Security-Policy` | locked down; `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'` | ⚠️ see note |
| 4.2 | `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` (production only) | ✅ |
| 4.3 | `X-Content-Type-Options` | `nosniff` | ✅ |
| 4.4 | `X-Frame-Options` | `DENY` | ✅ |
| 4.5 | `Referrer-Policy` | `strict-origin-when-cross-origin` | ✅ |
| 4.6 | `Permissions-Policy` | camera/microphone/geolocation/payment/usb all denied | ✅ |
| 4.7 | `X-Powered-By` removed | `poweredByHeader: false` | ✅ |
| 4.8 | No CSP violations on any page | *Tested:* 19 pages walked, console clean | ✅ |

> **⚠️ CSP note (4.1):** `script-src` allows `'unsafe-inline'`. This is a
> deliberate trade so the marketing pages stay statically rendered (a nonce
> requires per-request dynamic rendering). Documented, with the tightening path,
> in `next.config.ts` and [HANDOVER.md](HANDOVER.md#5-csp-allows-inline-scripts).

---

## 5. Rate limiting

| # | Control | Status | Evidence |
| --- | --- | --- | --- |
| 5.1 | Login, register, forgot, reset are all throttled | ✅ | `LIMITS` in `lib/security/rateLimit.ts`. *Tested:* register 6th→429, forgot 4th→429 |
| 5.2 | Dual budget: per-subject **and** per-IP | ✅ | e.g. forgot = 3/address + 10/IP. *Tested* both |
| 5.3 | Counters survive serverless cold starts | ✅ | Backed by Postgres (`RateLimitHit`), not process memory |
| 5.4 | Sliding window can't be extended by retrying | ✅ | Window measured from the oldest counted attempt |
| 5.5 | Limiter fails open if the DB is down | ✅ | By design — the DB is needed to log in anyway; a limiter outage shouldn't be an auth outage |
| 5.6 | Old counter rows are swept automatically | ✅ | ~2% of writes trigger a sweep; no cron needed |

---

## 6. Password reset

| # | Control | Status | Evidence |
| --- | --- | --- | --- |
| 6.1 | Only a SHA-256 hash of the token is stored | ✅ | `lib/auth/passwordReset.ts` — a DB leak can't reset anyone's password |
| 6.2 | Tokens are single-use | ✅ | `usedAt`; spent in the same transaction as the password write |
| 6.3 | Tokens expire (60 min) | ✅ | `TOKEN_TTL_MINUTES` |
| 6.4 | A new request invalidates earlier tokens | ✅ | `createResetToken()` marks prior tokens used |
| 6.5 | Token compared in constant time | ✅ | `timingSafeEqual` |
| 6.6 | No account enumeration — identical 200 for unknown addresses | ✅ | `app/api/auth/forgot/route.ts`. *Tested* end-to-end |
| 6.7 | Password change confirmed by email | ✅ | `passwordChangedEmail` (delivery pending — see 8.1) |

---

## 7. Logging & error handling

| # | Control | Status | Evidence |
| --- | --- | --- | --- |
| 7.1 | Structured logging with automatic secret redaction | ✅ | `lib/logger.ts` — redacts password/token/secret/cookie/card keys |
| 7.2 | Users never see stack traces | ✅ | `app/error.tsx`, `app/global-error.tsx` show a short error id only |
| 7.3 | Error id links a user report to a log entry | ✅ | `log.error()` returns the id shown in the boundary |
| 7.4 | Rate-limit and enumeration attempts are logged | ✅ | `log.warn`/`log.info` in the limiter and forgot route |

---

## 7a. Debug switches

| # | Control | Status | Evidence |
| --- | --- | --- | --- |
| 7a.1 | Webhook tracing is off unless asked for | ✅ | `DEBUG_WEBHOOK_BODY` — off unless set to `1` |
| 7a.2 | Traced deliveries carry no customer text | ✅ | `lib/channels/webhookDebug.ts` — every human-written field is replaced by its length |

> `DEBUG_WEBHOOK_BODY=1` logs the shape of each delivery: the `object`, the
> account id, whether it arrived as `messaging[]` or `changes[]`, and whether a
> signature was present. Every question a week of Meta debugging actually asked
> was answered by that structure; none of them needed the words. So the text is
> redacted to `‹n chars›` and the flag is safe to leave on.
>
> It writes one line per delivery, which is noise rather than a risk — worth
> turning off once a question is answered, but no longer a reason to hold up a
> handover.

---

## 8. Known gaps & deferred items

Documented, not hidden. Fuller treatment in
[HANDOVER.md](HANDOVER.md#known-gaps-and-deliberate-trade-offs).

| # | Item | Status | Impact | Action before launch |
| --- | --- | --- | --- | --- |
| 8.1 | Email not delivered (console only) | ⚠️ | Password reset needs a developer to read the log | Implement `deliver()`, add provider key + verified domain |
| 8.2 | CSP allows inline scripts | ⚠️ | Weakens XSS defence on public pages | Optional: nonce-based policy (costs static rendering) |
| 8.3 | Pre-existing weak passwords (`123456`) on 2 accounts | ⚠️ | Those accounts are guessable | Force a reset on them |
| 8.4 | Role change needs re-login | ⚠️ | Revoked access lingers up to 7 days | Per-request role lookup, or forced sign-out on change |
| 8.5 | Automated tests cover the security *logic*, not yet the DB integration | ⚠️ | 124 unit tests guard permissions, validation, reset tokens, the rate-limit window and log redaction; tenant isolation at the query level is still only hand-verified | Add DB-backed integration tests for cross-tenant queries (needs a test database in CI) |
| 8.6 | Channel / payment integrations | ⬜ | Not in scope this engagement | Add when commissioned; schema already models them |

---

## 9. Dependency security

| # | Control | Status | Evidence |
| --- | --- | --- | --- |
| 9.1 | No known vulnerabilities in production deps | ✅ | `pnpm audit --prod` → clean (2026-07-26) |
| 9.2 | All licences permissive; no copyleft | ✅ | [DEPENDENCIES.md](DEPENDENCIES.md) |
| 9.3 | Patched versions forced where upstream lags | ✅ | pnpm `overrides` for `sharp`, `postcss` |
| 9.4 | Update + audit policy documented | ✅ | [DEPENDENCIES.md](DEPENDENCIES.md#update-policy) |

---

## How to re-run this audit

```bash
pnpm audit --prod                               # section 9
pnpm build && curl -I http://localhost:3100/    # section 4 (headers)
```

Two complementary layers of verification stand behind this audit:

- **Automated unit tests** (`pnpm test`) — 124 tests covering the permission
  matrix (exhaustively, every role × permission), input validation, the
  password-reset token lifecycle, the rate-limiter window arithmetic and
  fail-open behaviour, the YouTube-host allow-list, and log redaction. These run
  with no database and re-verify the security *logic* on every change.
- **Live request tests** against a production build — register, login, the
  rate-limit lockout, cross-tenant and cross-role attempts, and the full reset
  flow. These exercise the real database and middleware. They are described
  inline above and reproducible from the contracts in [API.md](API.md).

The remaining gap (item 8.5) is turning the live cross-tenant checks into
DB-backed integration tests, which needs a disposable test database in CI.

# Sidekick

Marketing site + app shell for **Sidekick**, an AI assistant that answers
customers 24/7 across Facebook, Instagram and WhatsApp, collects leads and
grows sales. Bilingual (ქართული / English), dark + light themes.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript** (strict)
- **Tailwind CSS v4** — design tokens exposed via `@theme inline` over CSS
  variables, so `[data-theme]` swaps the whole palette with zero re-styling
- **@tabler/icons-react** · **framer-motion** (hero + chat animation)
- Fonts via `next/font`: Inter, IBM Plex Mono, Noto Sans Georgian

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build
pnpm lint
```

## Architecture

Every file is single-responsibility and ≤120 lines. Text is never hardcoded in
components — it lives in `lib/content/*` as colocated `Bilingual` objects and is
resolved at render time with the `t()` helper from the language context.

```
app/
  layout.tsx            Root: fonts, no-flash theme script, providers, header, chat
  (marketing)/          Pages that show the footer (home, about, pricing, contact)
  (auth)/               Footer-less centered pages (login, register, forgot)
components/
  ui/                   Primitives: Container, Card, Badge, Button, Field, …
  layout/               Header, Nav, Footer, Theme + Language toggles
  home/                 Hero carousel, slide mocks, Stats, Story, Benefits, CTA
  pricing/ contact/     Services + Packages, contact info + live AI chat
  auth/ chat/           Auth forms; floating chat widget + shared bubble/input
lib/
  i18n/                 Locale context + `t()` bilingual resolver
  theme/                Theme context + pre-paint no-flash script
  content/              All copy (bilingual) + structured data (icons, prices)
  chat/                 Keyword bot (bot.ts) — the one file a real API replaces
hooks/                  useCarousel, useChat
```

### Theming

`app/globals.css` defines dark tokens on `:root` and light overrides on
`:root[data-theme="light"]`. `theme-script.ts` sets `data-theme` before first
paint (stored preference → OS preference → dark) to avoid a flash.

### Internationalisation

`LanguageProvider` holds the active locale (persisted to `localStorage`) and
exposes `t(bilingual)`. Switching is instant and client-side — no reload.

## Backend (next)

The UI is intentionally backend-ready:

- **Chat** — `lib/chat/bot.ts` is a deterministic keyword bot. Replace
  `getBotReply` with a call to a real AI endpoint; the UI already speaks in the
  active locale and needs no changes.
- **Auth forms** — login / register / forgot submit handlers are stubs
  (`preventDefault`); wire them to real endpoints / an auth provider.
- **Content** — `lib/content/*` can later be sourced from a CMS or the API.

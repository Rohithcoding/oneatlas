# OneAtlas — AI model discovery & intelligence

A working MVP of [oneatlas.dev](https://oneatlas.dev/): a searchable catalogue of AI models with side-by-side comparison, pricing, capabilities, providers, benchmarks and rankings.

Every screen is driven by **PostgreSQL through Prisma** and exposed through typed Next.js Route Handlers. Nothing in the UI is hardcoded catalogue data.

- **Live demo:** https://oneatlas-rohithcodings-projects.vercel.app
- **Repository:** https://github.com/Rohithcoding/oneatlas

## Role

**Full Stack Engineer** — frontend, backend, data model, APIs and deployment.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Route Handlers, Turbopack) |
| UI | React 19, TypeScript, Tailwind CSS 4, lucide-react |
| Data | PostgreSQL 18, Prisma 6 |
| Client state | TanStack Query (server cache), URL search params, `useSyncExternalStore` (compare tray) |
| Validation | Zod |
| Local DB | embedded-postgres (real Postgres, zero setup) |

## Features

- **Landing page** with live catalogue stats, release activity chart, capability coverage, latest releases and leaderboard preview.
- **Model explorer** (`/models`) with debounced search, URL-synced filters (lab, provider, type, capabilities, context, price, free/open weights), six sort modes, table/grid views and pagination. Column headers are sortable.
- **Model detail** (`/models/[...slug]`) with full specs, capabilities matrix, benchmark bars, provider pricing table, cost snapshot and related models.
- **Compare** (`/compare?models=a,b,c`) with up to five models, derived "index per dollar" metric, winner highlighting and a persistent tray across the app. Shareable via URL.
- **Rankings** (`/rankings`) by overall intelligence index, category averages, or any one of 10 benchmarks.
- **Benchmarks** (`/benchmarks`), **labs** (`/labs`), **providers** (`/providers`) directories with detail pages and API-backed search.
- **⌘K / Ctrl+K command palette** searching models, labs and providers in one request.
- Responsive layout (mobile nav, horizontally scrollable tables) and a consistent error/loading/empty-state system.

## Architecture

```
src/
  app/
    api/                 # typed Route Handlers (models, compare, rankings, labs, providers, search, stats…)
    models/, rankings/   # Server Components fetch initial data via lib/queries
    benchmarks/, labs/, providers/, compare/
  components/            # UI: explorer, tables, compare, rankings, shell, command palette
  hooks/                 # compare selection (localStorage external store)
  lib/
    prisma.ts            # singleton PrismaClient
    schema.prisma -> prisma/
    queries.ts           # single source of truth for filtering, ranking and DTO mapping
    validation.ts        # Zod parsing of query strings
    types.ts             # public DTOs shared by API and UI
    api.ts               # consistent JSON error envelope + cache headers
prisma/schema.prisma     # Lab, Provider, Model, ModelProvider, Benchmark, BenchmarkScore
prisma/seed.ts           # deterministic demo catalogue (87 models, 24 labs, 41 providers, 10 benchmarks)
scripts/
  start-db.mjs           # local embedded Postgres
  self-host.mjs          # production bootstrap (DB, schema, seed, next start)
```

**Data flow:** browser → Route Handler → `lib/queries.ts` → Prisma → PostgreSQL. Server Components call the same query functions for first paint; client components re-fetch through the API with TanStack Query and mirror state into the URL.

## Run locally

```bash
npm install
npm run db:dev          # start embedded Postgres on :5432 (leave running)
npm run db:generate     # generate Prisma client
npm run db:push         # apply schema
npm run db:seed         # load the demo catalogue
npm run dev             # http://localhost:3000
```

Use any standard PostgreSQL URL instead by setting `DATABASE_URL`; skip `db:dev` in that case.

Quality checks:

```bash
npm run typecheck
npm run lint
npm run build
```

## API

| Endpoint | Description |
| --- | --- |
| `GET /api/models` | `q`, `lab`, `provider`, `type`, `capabilities`, `minContext`, `maxPrice`, `free`, `openWeights`, `sort`, `page`, `limit` |
| `GET /api/models/[...slug]` | full model record with listings, scores and related models |
| `GET /api/compare?models=a,b` | up to five full records |
| `GET /api/rankings?benchmark=&category=&limit=` | leaderboards |
| `GET /api/benchmarks` | benchmark catalogue |
| `GET /api/labs`, `GET /api/labs/[slug]` | lab directory and detail |
| `GET /api/providers`, `GET /api/providers/[slug]` | provider directory and detail |
| `GET /api/search?q=` | unified search across models, labs and providers |
| `GET /api/stats` | aggregate homepage statistics |

All responses are JSON; errors use `{ error: { message, details? } }` with appropriate HTTP status codes.

## Deployment

**Option A — Vercel + managed Postgres (used for the live demo):** the deployed instance uses **Prisma Postgres** from the Vercel Marketplace. Create a Postgres database, set `DATABASE_URL` for the Vercel project, then import this repo. Push the schema and seed once against that database:

```bash
DATABASE_URL='postgres://…' npx prisma db push --skip-generate
DATABASE_URL='postgres://…' npm run db:seed
```

Any standard Postgres URL (Neon, Supabase, Railway) works the same way. No other configuration is required.

**Option B — single free host (included):** [`render.yaml`](./render.yaml) provisions a Node web service that runs `scripts/self-host.mjs`. It boots embedded PostgreSQL when `DATABASE_URL` is local, applies the schema, seeds an empty catalogue and starts `next start`. Point `DATABASE_URL` at an external Postgres to use the same entrypoint with a managed database.

The catalogue is illustrative generated data; it is safe to reseed with `npm run db:reset`.

## 5-minute demo / Loom outline

1. **00:00** — What OneAtlas is; the reference platforms studied (OpenRouter, RouterPlus, LiteLLM, OneAtlas itself) and the gap: a fast, filterable catalogue with real provider pricing and comparisons.
2. **00:45** — Role and architecture: Next.js 16 App Router, Prisma/PostgreSQL, shared query layer, Route Handlers, TanStack Query, URL state, compare store.
3. **01:45** — Data model walkthrough: labs → models → provider listings → benchmarks/scores; deterministic seed of 87 models.
4. **02:30** — Live demo: home stats → explorer search/filters/sorts → model detail → add two models to compare → shareable comparison table.
5. **04:00** — Rankings, benchmarks, ⌘K palette, lab/provider directories.
6. **04:45** — Decisions & challenges: Next 16 async `params`/`searchParams`, route-aware types via `next typegen`, disabling Cache Components for a fully DB-backed app, React 19 effect lint (localStorage external store), local Postgres without Docker.
7. **05:15** — What's next: auth/watchlists, live upstream sync, user evals/routing (RouterPlus-style), saved comparisons.

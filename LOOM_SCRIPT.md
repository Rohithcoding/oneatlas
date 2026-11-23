# Loom recording script (~8 minutes)

Use this as a teleprompter while sharing your screen. Start on the live site at
https://oneatlas-rohithcodings-projects.vercel.app

## 0:00 — Intro (30s)
“This is OneAtlas, a working MVP of oneatlas.dev — a discovery and intelligence platform for AI models. The live demo is deployed on Vercel, the code is on GitHub, and every screen is powered by PostgreSQL through Prisma. I chose the **Full Stack Engineer** role so I could own the data model, APIs, frontend, and deployment end to end.”

Briefly show the repo URL: https://github.com/Rohithcoding/oneatlas

## 0:30 — Architecture (45s)
Say the flow out loud while pointing at the screen:

`Browser → Next.js Route Handler → lib/queries.ts → Prisma → PostgreSQL`

Mention the stack: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Prisma 6, PostgreSQL, TanStack Query, Zod. Server Components render the first page from the same query layer the APIs use; client components refetch through the API and mirror filters into the URL.

## 1:15 — Data model (45s)
Open `prisma/schema.prisma`. Point at:
- `Lab` → `Model` (one-to-many)
- `Model` ↔ `Provider` through `ModelProvider` (pricing/availability listings)
- `Benchmark` → `BenchmarkScore` → `Model` (scores)
- Indexes on slug, lab, type, and intelligence for fast filtering

Then show `prisma/seed.ts`: “87 models, 24 labs, 41 providers, 10 benchmarks, 286 listings, 462 scores — deterministic generated data.”

## 2:00 — API layer (45s)
Open `https://oneatlas-rohithcodings-projects.vercel.app/api/stats` in the browser and show the JSON response. Mention the consistent error envelope and Zod validation of query params.

## 2:45 — Home page (45s)
Scroll through the live home page: live stats, releases-per-month chart, capability coverage, latest releases, leaderboard preview. Emphasise the numbers come from SQL aggregates, not hardcoded values.

## 3:30 — Model explorer (1m30s)
Go to `/models`.
1. Type `Claude` in search — URL becomes `?q=Claude`, six results.
2. Toggle a lab filter (e.g. Anthropic), then clear it.
3. Sort by **Intelligence** using the sort dropdown or a column header.
4. Switch between table and grid view.
5. Show pagination and the result count.
6. Open a model card/detail page.

## 4:30 — Model detail (45s)
On `/models/anthropic/claude-sonnet-5`, show capabilities, benchmark bars, provider pricing table, cost snapshot, and related models.

## 5:15 — Compare (1m)
1. Click **Add to comparison** on two or three models. Show the persistent tray.
2. Click **Compare** in the tray.
3. On `/compare`, show the side-by-side matrix, winner highlighting, and the derived “index per dollar” metric.
4. Point at the URL — `?models=a,b,c` — so a comparison can be shared.

## 6:15 — Rankings & benchmarks (45s)
Show `/rankings`: overall intelligence index, category averages, and per-benchmark leaderboards. Then show `/benchmarks` and open one benchmark directory entry.

## 6:45 — Command palette (30s)
Press **Ctrl+K** (or Cmd+K), type `gem`, and open a result. Mention it searches models, labs, and providers in one API call.

## 7:15 — Directories (30s)
Quickly show `/labs`, open a lab detail page, then `/providers` and a provider detail page.

## 7:45 — Decisions & challenges (45s)
Talk through:
- Next.js 16 async `params` / `searchParams` and route-aware types from `next typegen`.
- Cache Components had to be disabled because every screen is DB-backed and must render at request time.
- React 19 effect lint pushed compare state into `useSyncExternalStore` backed by localStorage.
- Avoided Docker for local Postgres with an embedded PostgreSQL launcher; production uses managed Prisma Postgres on Vercel.

## 8:30 — What’s next (20s)
Auth + watchlists, live upstream data sync, user evals and routing in the style of RouterPlus, and saved/shared comparisons.

## Recording tips
- 1080p, full browser window, hide notifications.
- Keep tabs preloaded: live site, `/models`, `/compare`, GitHub schema file.
- If you run long, cut the directories section first; the core demo is steps 1–6.

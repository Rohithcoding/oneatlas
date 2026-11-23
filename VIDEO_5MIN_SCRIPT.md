# 5-minute demo video — word-for-word script

Read this at a calm pace. The **Say** column is what you speak; the **Show** column is what you click or point at.

Before recording, preload these tabs:
1. https://oneatlas-rohithcodings-projects.vercel.app
2. https://oneatlas-rohithcodings-projects.vercel.app/models
3. https://oneatlas-rohithcodings-projects.vercel.app/api/stats
4. GitHub repo with `prisma/schema.prisma` open
5. https://oneatlas-rohithcodings-projects.vercel.app/compare (ready to paste a URL)

Use Loom → **Screen + Camera off**, record the browser window at 1080p, hide notifications.

---

## 0:00–0:20 — Intro

**Show:** Live home page.

**Say:**
> Hi, I'm Rohith. This is OneAtlas — a working MVP of oneatlas.dev. It's an AI model discovery platform where you can search, filter, compare, and rank models. I built it as the Full Stack Engineer, so I owned the frontend, backend, database, APIs, and the deployment. The live demo and GitHub repo are linked below.

---

## 0:20–0:50 — Architecture

**Show:** Keep the home page on screen, or switch to the repo README architecture section.

**Say:**
> Here's the architecture in one sentence: the browser talks to a Next.js Route Handler, which calls a shared query layer, which uses Prisma to read PostgreSQL. The stack is Next.js 16, React 19, TypeScript, Tailwind CSS, Prisma 6, and PostgreSQL. Server components fetch the first render from that same query layer; the client then refetches through the APIs with TanStack Query, and filters are mirrored into the URL so every view is shareable.

---

## 0:50–1:20 — Data model

**Show:** `prisma/schema.prisma` in GitHub. Point at `Lab`, `Model`, `ModelProvider`, `Benchmark`, `BenchmarkScore`.

**Say:**
> On screen is the Prisma schema. A Lab, like Anthropic, has many Models. Each Model has many Provider listings — that's where pricing and availability live. Benchmarks connect to Models through BenchmarkScore records. I also indexed slug, lab, type, and intelligence for fast filtering. The seed file generates eighty-seven models, twenty-four labs, forty-one providers, and ten benchmarks — all deterministic demo data.

---

## 1:20–1:45 — API layer

**Show:** `/api/stats` JSON in the browser.

**Say:**
> This is the API layer. Every endpoint returns JSON with a consistent error shape, and query parameters are validated with Zod. Here's the stats endpoint live in production — it returns eighty-seven models and the aggregate numbers you'll see on the home page. Nothing in the interface is hardcoded catalogue data.

---

## 1:45–2:20 — Home page

**Show:** Back to the live home page; scroll slowly through stats, chart, capability coverage, latest releases.

**Say:**
> Now the live app. The home page shows real SQL aggregates: model count, lab count, provider count, releases per month, and capability coverage. These update automatically when the database changes. From here I can jump into the explorer, rankings, or open the command palette with Control-K.

---

## 2:20–3:00 — Model explorer

**Show:** `/models`. Type `Claude` in the search box. Change sort to Intelligence. Toggle table/grid. Click a column header. Show pagination.

**Say:**
> This is the model explorer. I'll type "Claude" — notice the URL updates to question-mark q equals Claude, and I get six results. I can filter by lab, provider, model type, capability, context window, and price. Sorting works from this dropdown or by clicking a column header. I can switch between table and grid view, and pagination keeps the page fast. Let me open Claude Sonnet 5.

---

## 3:00–3:25 — Model detail

**Show:** `/models/anthropic/claude-sonnet-5`. Point at capabilities, benchmark bars, provider pricing, cost snapshot, related models.

**Say:**
> The detail page shows the full record: specs, capability flags, benchmark bars with scores, a provider pricing table, a cost snapshot, and related models. Everything here came from the model API route, which joins labs, listings, and scores in Prisma.

---

## 3:25–4:00 — Compare

**Show:** Click **Add to comparison** on two or three models. Show the tray, then click **Compare**. Point at the URL `?models=...`.

**Say:**
> Now I'll add two or three models to comparison using these buttons. A tray appears at the bottom and follows me across the app. Clicking Compare opens a side-by-side matrix with winner highlighting and a derived metric — index per dollar. The URL contains the model slugs, so I can share this exact comparison with anyone.

---

## 4:00–4:25 — Rankings and benchmarks

**Show:** `/rankings`, then `/benchmarks`, then briefly `/labs` and `/providers`.

**Say:**
> Rankings gives leaderboards by overall intelligence, by category, or by any single benchmark. The Benchmarks page lists all ten evaluations, and the Labs and Providers pages are searchable directories with detail views.

---

## 4:25–4:45 — Command palette

**Show:** Press **Control-K**, type `gem`, press Enter. Land on Gemini detail page.

**Say:**
> One more shortcut: Control-K opens a command palette that searches models, labs, and providers in a single API call. Type "gem" and press Enter — I'm on Gemini's detail page.

---

## 4:45–5:00 — Decisions and close

**Show:** Back to home page or repo README.

**Say:**
> The main challenges were Next 16's async params, route-aware types from next typegen, and disabling Cache Components because every page is database-backed. Next up: watchlists and live upstream sync. Thanks for watching.

---

## If you run over time
Cut the **Labs and Providers** sentence in the rankings section first. If still long, shorten the architecture section to just the first two sentences.

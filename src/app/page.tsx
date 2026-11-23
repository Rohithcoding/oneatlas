import Link from 'next/link';
import { ArrowRight, ArrowUpRight, BarChart3, Building2, GitCompareArrows, Layers3, Server, Sparkles, TrendingUp } from 'lucide-react';
import { getModels, getRankings, getStats } from '@/lib/queries';
import { parseModelQuery } from '@/lib/validation';
import { HomeSearch } from '@/components/home-search';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatCompact, formatContext, formatDate, formatPrice, formatScore, modelHref } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [stats, recent, rankings] = await Promise.all([
    getStats(),
    getModels(parseModelQuery({ sort: 'released', limit: '6' })),
    getRankings({ benchmark: '', category: '', limit: 6 }),
  ]);

  const maxReleases = Math.max(...stats.releasesByMonth.map((item) => item.count), 1);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-slate-50 via-white to-white">
        <div className="grid-pattern pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        <div className="pointer-events-none absolute -top-32 left-1/2 size-[520px] -translate-x-1/2 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="relative mx-auto max-w-[1200px] px-4 pb-16 pt-20 sm:px-6 sm:pt-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
              <Sparkles className="size-3.5" /> Catalogue updated {formatDate(new Date().toISOString())}
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Every AI model,
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent"> compared.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Specs, pricing, capabilities and providers in one place. Sort any column, filter to what you need, and open a model for the full record.
            </p>
            <div className="mt-8 flex justify-center"><HomeSearch /></div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <Link href="/models" className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-indigo-600">
                Browse models <ArrowRight className="size-3.5" />
              </Link>
              <Link href="/rankings" className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                See rankings
              </Link>
              <Link href="/compare" className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                <GitCompareArrows className="size-3.5" /> Compare
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-4">
            {[
              { label: 'Models', value: stats.models, Icon: Layers3 },
              { label: 'Labs', value: stats.labs, Icon: Building2 },
              { label: 'Providers', value: stats.providers, Icon: Server },
              { label: 'API listings', value: stats.listings, Icon: BarChart3 },
            ].map((item) => (
              <div key={item.label} className="bg-white px-5 py-5">
                <div className="flex items-center justify-between text-xs text-slate-500"><span>{item.label}</span><item.Icon className="size-3.5 text-indigo-500" /></div>
                <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-slate-900">{formatCompact(item.value)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics strip */}
      <section className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Releases per month</h2>
                <p className="mt-1 text-xs text-slate-500">{stats.releasesLastYear} models released in the last 12 months</p>
              </div>
              <TrendingUp className="size-4 text-indigo-500" />
            </div>
            <div className="mt-6 flex h-28 items-end gap-1.5">
              {stats.releasesByMonth.map((item, index) => (
                <div key={`${item.month}-${index}`} className="group relative flex flex-1 flex-col items-center justify-end gap-2">
                  <span className="pointer-events-none absolute -top-7 hidden rounded bg-slate-900 px-1.5 py-0.5 text-[10px] text-white group-hover:block">{item.count}</span>
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-indigo-500 to-violet-400 transition-all group-hover:from-indigo-600 group-hover:to-violet-500"
                    style={{ height: `${Math.max(4, (item.count / maxReleases) * 100)}%` }}
                  />
                  <span className="text-[9px] text-slate-400">{item.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Capability coverage</h2>
                <p className="mt-1 text-xs text-slate-500">Share of active models supporting each capability</p>
              </div>
              <Sparkles className="size-4 text-indigo-500" />
            </div>
            <div className="mt-6 space-y-4">
              {stats.capabilityCoverage.map((item) => (
                <div key={item.key}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-mono font-semibold text-slate-900">{item.percentage}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Latest models */}
      <section className="border-y border-slate-200 bg-slate-50/60">
        <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Latest releases</h2>
              <p className="mt-1 text-sm text-slate-500">The newest models added to the catalogue.</p>
            </div>
            <Link href="/models" className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline">View all <ArrowRight className="size-3.5" /></Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recent.data.map((model) => (
              <Link key={model.id} href={modelHref(model.slug)} className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-md">
                <div className="flex items-center gap-2.5">
                  <Avatar name={model.lab.name} color={model.lab.color} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-indigo-600">{model.name}</p>
                    <p className="text-xs text-slate-500">{model.lab.name} · {formatDate(model.releasedAt)}</p>
                  </div>
                  <Badge tone="neutral">{model.type}</Badge>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 font-mono text-xs text-slate-600">
                  <span>{formatContext(model.contextWindow)} ctx</span>
                  <span>{formatPrice(model.inputPrice, model.free)} / {formatPrice(model.outputPrice, model.free)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard preview + quick links */}
      <section className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Top of the index</h2>
                <p className="mt-0.5 text-xs text-slate-500">OneAtlas Intelligence Index</p>
              </div>
              <Link href="/rankings" className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline">Full leaderboard <ArrowUpRight className="size-3" /></Link>
            </div>
            <div className="divide-y divide-slate-100">
              {rankings.rows.slice(0, 5).map((row) => (
                <Link key={row.model.id} href={modelHref(row.model.slug)} className="flex items-center gap-3 px-5 py-3 transition hover:bg-slate-50">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-50 font-mono text-xs font-semibold text-indigo-700">{row.rank}</span>
                  <Avatar name={row.model.lab.name} color={row.model.lab.color} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">{row.model.name}</span>
                  <span className="hidden text-xs text-slate-400 sm:inline">{row.model.lab.name}</span>
                  <span className="font-mono text-sm font-semibold tabular-nums text-slate-900">{formatScore(row.score, rankings.benchmark.unit)}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {[
              { href: '/benchmarks', label: 'Benchmarks', desc: 'Explore the evaluations behind the rankings', Icon: BarChart3, tone: 'bg-amber-50 text-amber-600' },
              { href: '/labs', label: 'AI labs', desc: `${stats.labs} organizations building models`, Icon: Building2, tone: 'bg-sky-50 text-sky-600' },
              { href: '/providers', label: 'Providers', desc: `${stats.providers} ways to access models`, Icon: Server, tone: 'bg-emerald-50 text-emerald-600' },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-md">
                <span className={`flex size-10 items-center justify-center rounded-lg ${item.tone}`}><item.Icon className="size-5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-900 group-hover:text-indigo-600">{item.label}</span>
                  <span className="block truncate text-xs text-slate-500">{item.desc}</span>
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-slate-300 group-hover:text-indigo-500" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

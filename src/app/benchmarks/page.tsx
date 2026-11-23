import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, BarChart3, Layers3 } from 'lucide-react';
import { getBenchmarks } from '@/lib/queries';
import { Badge } from '@/components/ui/badge';
import { BENCHMARK_CATEGORIES, formatScore, modelHref } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Benchmarks',
  description: 'Explore the evaluations behind the OneAtlas model rankings.',
};

const categoryTone = {
  coding: 'indigo',
  reasoning: 'sky',
  math: 'amber',
  science: 'emerald',
  language: 'neutral',
  vision: 'rose',
  agentic: 'indigo',
} as const;

export default async function BenchmarksPage() {
  const benchmarks = await getBenchmarks();

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Evaluations</p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Benchmarks</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Each benchmark measures a different capability. Open a leaderboard to see how every model scores.
        </p>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Benchmarks tracked', value: benchmarks.length, Icon: BarChart3 },
          { label: 'Categories covered', value: BENCHMARK_CATEGORIES.length, Icon: Layers3 },
          { label: 'Scored model results', value: benchmarks.reduce((sum, item) => sum + item.modelCount, 0), Icon: ArrowUpRight },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">{item.label}</span>
              <item.Icon className="size-4 text-indigo-500" />
            </div>
            <p className="mt-2 font-mono text-2xl font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {benchmarks.map((benchmark) => (
          <article key={benchmark.slug} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition hover:border-indigo-200 hover:shadow-md hover:shadow-slate-900/5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold text-slate-900">{benchmark.name}</h2>
                  <Badge tone={categoryTone[benchmark.category]}>{benchmark.category}</Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{benchmark.description}</p>
              </div>
              <span className="shrink-0 rounded-lg bg-slate-50 px-2 py-1 font-mono text-[11px] text-slate-500">max {benchmark.maxScore}{benchmark.unit}</span>
            </div>
            <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
              <div>
                <p className="text-[11px] text-slate-400">Top performer</p>
                {benchmark.topModel ? (
                  <Link href={modelHref(benchmark.topModel.slug)} className="mt-1 block text-sm font-medium text-indigo-600 hover:underline">
                    {benchmark.topModel.name}
                  </Link>
                ) : (
                  <p className="mt-1 text-sm text-slate-400">No scores yet</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-semibold text-slate-900">
                  {benchmark.topModel ? formatScore(benchmark.topModel.score, benchmark.unit) : '—'}
                </p>
                <Link href={`/rankings?benchmark=${benchmark.slug}`} className="text-[11px] font-medium text-indigo-600 hover:underline">
                  View leaderboard →
                </Link>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-slate-400">{benchmark.modelCount} model results recorded</p>
          </article>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Award, Crown, Medal, Trophy } from 'lucide-react';
import type { BenchmarkSummary, RankingsResponse } from '@/lib/types';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { BENCHMARK_CATEGORIES, cn, formatContext, formatPrice, formatScore, modelHref } from '@/lib/utils';

async function fetchRankings(benchmark: string, category: string): Promise<RankingsResponse> {
  const params = new URLSearchParams();
  if (benchmark) params.set('benchmark', benchmark);
  if (category) params.set('category', category);
  const response = await fetch(`/api/rankings?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to load rankings');
  return response.json();
}

export function RankingsView({
  benchmarks,
  initialBenchmark,
  initialCategory,
  initialData,
}: {
  benchmarks: BenchmarkSummary[];
  initialBenchmark: string;
  initialCategory: string;
  initialData: RankingsResponse;
}) {
  const [benchmark, setBenchmark] = useState(initialBenchmark);
  const [category, setCategory] = useState(initialCategory);

  useEffect(() => {
    const params = new URLSearchParams();
    if (benchmark) params.set('benchmark', benchmark);
    if (category) params.set('category', category);
    const query = params.toString();
    window.history.replaceState(null, '', `/rankings${query ? `?${query}` : ''}`);
  }, [benchmark, category]);

  const { data, isFetching } = useQuery({
    queryKey: ['rankings', benchmark, category],
    queryFn: () => fetchRankings(benchmark, category),
    initialData: benchmark === initialBenchmark && category === initialCategory ? initialData : undefined,
    placeholderData: (previous) => previous,
  });

  const rows = data?.rows ?? initialData.rows;
  const info = data?.benchmark ?? initialData.benchmark;
  const top3 = rows.slice(0, 3);
  const visible = rows.slice(3);
  const maxScore = useMemo(() => Math.max(...rows.map((row) => row.score), 1), [rows]);

  function selectBenchmark(value: string) {
    setBenchmark(value);
    setCategory('');
  }

  function selectCategory(value: string) {
    setCategory(value);
    setBenchmark('');
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Leaderboards</p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Model rankings</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">See which models lead on overall intelligence, individual benchmarks and task categories.</p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          onClick={() => { setBenchmark(''); setCategory(''); }}
          className={cn(
            'rounded-lg px-3 py-2 text-sm font-medium transition',
            !benchmark && !category ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          )}
        >
          Overall index
        </button>
        {BENCHMARK_CATEGORIES.slice(0, 5).map((item) => (
          <button
            key={item.key}
            onClick={() => selectCategory(item.key)}
            className={cn(
              'rounded-lg px-3 py-2 text-sm font-medium capitalize transition',
              category === item.key ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            )}
          >
            {item.label}
          </button>
        ))}
        <select
          value={benchmark}
          onChange={(event) => selectBenchmark(event.target.value)}
          className={cn(
            'h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-400',
            benchmark ? 'font-medium text-indigo-700' : 'text-slate-600'
          )}
        >
          <option value="">Specific benchmark…</option>
          {benchmarks.map((item) => (
            <option key={item.slug} value={item.slug}>{item.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600"><Trophy className="size-4.5" /></span>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{info.name}</h2>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">{info.description}</p>
          </div>
        </div>
      </div>

      {top3.length === 3 && (
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {top3.map((row, index) => {
            const icons = [Crown, Medal, Award];
            const Icon = icons[index];
            const tones = ['text-amber-500 bg-amber-50', 'text-slate-400 bg-slate-100', 'text-amber-700 bg-amber-50/60'];
            return (
              <Link
                key={row.model.id}
                href={modelHref(row.model.slug)}
                className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow-md"
              >
                <span className={cn('flex size-10 items-center justify-center rounded-xl', tones[index])}><Icon className="size-5" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">#{row.rank}</span>
                    <Avatar name={row.model.lab.name} color={row.model.lab.color} size="sm" />
                  </div>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-900 group-hover:text-indigo-600">{row.model.name}</p>
                  <p className="text-xs text-slate-500">{row.model.lab.name}</p>
                </div>
                <span className="font-mono text-lg font-semibold tabular-nums text-slate-900">{formatScore(row.score, info.unit)}</span>
              </Link>
            );
          })}
        </div>
      )}

      <div className={cn('overflow-hidden rounded-xl border border-slate-200 bg-white transition-opacity', isFetching && 'opacity-60')}>
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Rank</th>
                <th className="px-3 py-3 font-semibold">Model</th>
                <th className="px-3 py-3 font-semibold">Score</th>
                <th className="px-3 py-3 font-semibold">Input / 1M</th>
                <th className="px-3 py-3 font-semibold">Context</th>
                <th className="px-4 py-3 text-right font-semibold">Lab</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((row) => (
                <tr key={row.model.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex size-7 items-center justify-center rounded-lg font-mono text-xs font-semibold', row.rank <= 10 ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-500')}>
                      {row.rank}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <Link href={modelHref(row.model.slug)} className="font-medium text-slate-900 hover:text-indigo-600">{row.model.name}</Link>
                    <div className="mt-0.5 flex gap-1">
                      {row.model.capabilities.reasoning && <Badge tone="indigo">Reasoning</Badge>}
                      {row.model.free && <Badge tone="emerald">Free</Badge>}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-16 font-mono text-xs font-semibold tabular-nums text-slate-800">{formatScore(row.score, info.unit)}</span>
                      <span className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                        <span className="block h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${(row.score / maxScore) * 100}%` }} />
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-slate-600">{formatPrice(row.model.inputPrice, row.model.free)}</td>
                  <td className="px-3 py-3 font-mono text-xs text-slate-500">{formatContext(row.model.contextWindow)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/labs/${row.model.lab.slug}`} className="text-xs text-slate-500 hover:text-indigo-600">{row.model.lab.name}</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && (
            <p className="py-12 text-center text-sm text-slate-500">Not enough ranked models to display yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

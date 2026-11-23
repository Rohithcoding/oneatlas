'use client';

import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Check, Minus, Plus, Trash2, TrendingUp } from 'lucide-react';
import type { ModelDetail } from '@/lib/types';
import { setCompareIds, useCompare } from '@/hooks/use-compare';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn, formatContext, formatDate, formatPrice, modelHref } from '@/lib/utils';

async function fetchCompare(ids: string[]): Promise<ModelDetail[]> {
  const response = await fetch(`/api/compare?models=${encodeURIComponent(ids.join(','))}`);
  if (!response.ok) throw new Error('Failed to load comparison');
  return response.json();
}

type Row = {
  label: string;
  values: Array<{ text: ReactNode; best?: boolean; sub?: string }>;
};

export function CompareView({
  initialIds,
  initialModels,
}: {
  initialIds: string[];
  initialModels: ModelDetail[];
}) {
  const { ids, remove, clear } = useCompare();
  const activeIds = ids.length ? ids : initialIds;
  const key = activeIds.join(',');
  const initialKey = initialIds.join(',');
  const syncedFromUrl = useRef(false);

  // A shared /compare?models=… URL is authoritative over a stale local selection.
  useEffect(() => {
    if (syncedFromUrl.current || initialIds.length === 0) return;
    syncedFromUrl.current = true;
    if (initialIds.join(',') !== ids.join(',')) setCompareIds(initialIds);
  }, [initialIds, ids]);

  useEffect(() => {
    const params = ids.length ? `?models=${encodeURIComponent(ids.join(','))}` : '';
    window.history.replaceState(null, '', `/compare${params}`);
  }, [ids]);

  const { data } = useQuery({
    queryKey: ['compare', key],
    queryFn: () => fetchCompare(activeIds),
    initialData: key === initialKey ? initialModels : undefined,
    enabled: activeIds.length > 0,
  });

  const models = data ?? initialModels;

  const rows = useMemo<Row[]>(() => {
    if (models.length === 0) return [];
    const minInput = Math.min(...models.map((m) => m.inputPrice ?? Infinity));
    const minOutput = Math.min(...models.map((m) => m.outputPrice ?? Infinity));
    const maxContext = Math.max(...models.map((m) => m.contextWindow ?? 0));
    const maxOutputTokens = Math.max(...models.map((m) => m.maxOutput ?? 0));
    const maxIndex = Math.max(...models.map((m) => m.intelligence ?? 0));
    const valueScores = models.map((m) => {
      const blended = m.inputPrice !== null && m.outputPrice !== null ? (m.inputPrice * 3 + m.outputPrice) / 4 : null;
      return blended && blended > 0 ? (m.intelligence ?? 0) / blended : 0;
    });
    const maxValue = Math.max(...valueScores);

    const capabilityRows: Row[] = [
      { label: 'Reasoning', values: models.map((m) => ({ text: m.capabilities.reasoning ? <Check className="size-4 text-emerald-500" /> : <Minus className="size-4 text-slate-300" /> })) },
      { label: 'Tool calling', values: models.map((m) => ({ text: m.capabilities.toolCalling ? <Check className="size-4 text-emerald-500" /> : <Minus className="size-4 text-slate-300" /> })) },
      { label: 'Structured output', values: models.map((m) => ({ text: m.capabilities.structuredOutput ? <Check className="size-4 text-emerald-500" /> : <Minus className="size-4 text-slate-300" /> })) },
      { label: 'Vision input', values: models.map((m) => ({ text: m.capabilities.vision ? <Check className="size-4 text-emerald-500" /> : <Minus className="size-4 text-slate-300" /> })) },
      { label: 'Open weights', values: models.map((m) => ({ text: m.capabilities.openWeights ? <Check className="size-4 text-emerald-500" /> : <Minus className="size-4 text-slate-300" /> })) },
    ];

    const benchmarks = Array.from(new Set(models.flatMap((m) => m.scores.map((s) => s.benchmark.slug)))).slice(0, 6);

    return [
      {
        label: 'Lab',
        values: models.map((m) => ({ text: <Link href={`/labs/${m.lab.slug}`} className="font-medium text-indigo-600 hover:underline">{m.lab.name}</Link> })),
      },
      {
        label: 'Type',
        values: models.map((m) => ({ text: <span className="capitalize">{m.type}</span> })),
      },
      {
        label: 'Released',
        values: models.map((m) => ({ text: <span className="font-mono text-xs">{formatDate(m.releasedAt)}</span> })),
      },
      {
        label: 'Context window',
        values: models.map((m) => ({ text: <span className="font-mono font-medium">{formatContext(m.contextWindow)}</span>, best: m.contextWindow === maxContext && maxContext > 0, sub: 'tokens' })),
      },
      {
        label: 'Max output',
        values: models.map((m) => ({ text: <span className="font-mono">{formatContext(m.maxOutput)}</span>, best: m.maxOutput === maxOutputTokens && maxOutputTokens > 0 })),
      },
      {
        label: 'Input price',
        values: models.map((m) => ({ text: <span className="font-mono font-medium">{formatPrice(m.inputPrice, m.free)}</span>, best: m.inputPrice === minInput && minInput !== Infinity, sub: 'per 1M tokens' })),
      },
      {
        label: 'Output price',
        values: models.map((m) => ({ text: <span className="font-mono font-medium">{formatPrice(m.outputPrice, m.free)}</span>, best: m.outputPrice === minOutput && minOutput !== Infinity, sub: 'per 1M tokens' })),
      },
      {
        label: 'Intelligence index',
        values: models.map((m) => ({ text: <span className="font-mono font-semibold">{m.intelligence?.toFixed(1) ?? '—'}</span>, best: m.intelligence === maxIndex && maxIndex > 0, sub: '/ 100' })),
      },
      {
        label: 'Index per dollar',
        values: models.map((m, index) => ({ text: <span className="font-mono font-semibold">{valueScores[index] > 0 ? valueScores[index].toFixed(1) : '—'}</span>, best: valueScores[index] === maxValue && maxValue > 0, sub: 'higher is better' })),
      },
      {
        label: 'Parameters',
        values: models.map((m) => ({ text: m.parameters ?? '—' })),
      },
      {
        label: 'License',
        values: models.map((m) => ({ text: m.license ?? 'Proprietary' })),
      },
      {
        label: 'Providers',
        values: models.map((m) => ({ text: <span className="font-mono">{m.providerCount}</span> })),
      },
      ...capabilityRows,
      ...benchmarks.map((slug) => {
        const best = Math.max(...models.map((m) => m.scores.find((s) => s.benchmark.slug === slug)?.score ?? 0));
        const name = models.flatMap((m) => m.scores).find((s) => s.benchmark.slug === slug)?.benchmark.name ?? slug;
        return {
          label: name,
          values: models.map((m) => {
            const score = m.scores.find((s) => s.benchmark.slug === slug);
            return {
              text: <span className="font-mono font-medium">{score ? (score.benchmark.unit === 'Elo' ? Math.round(score.score).toString() : `${score.score.toFixed(1)}%`) : '—'}</span>,
              best: Boolean(score && score.score === best && best > 0),
            };
          }),
        };
      }),
    ];
  }, [models]);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/models" className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600"><ArrowLeft className="size-3" /> Back to models</Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Compare models</h1>
          <p className="mt-2 text-sm text-slate-500">Side-by-side specifications, pricing and benchmark performance.</p>
        </div>
        {models.length > 0 && (
          <div className="flex items-center gap-2">
            <Badge tone="indigo">{models.length} selected</Badge>
            <button onClick={clear} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">
              <Trash2 className="size-3.5" /> Clear all
            </button>
          </div>
        )}
      </div>

      {models.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><TrendingUp className="size-6" /></div>
          <h2 className="mt-4 text-base font-semibold text-slate-900">Start by adding models</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">Pick up to five models from the catalogue and compare their specs, pricing and benchmarks here.</p>
          <Link href="/models" className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-indigo-600">
            Browse models <Plus className="size-4" />
          </Link>
        </div>
      ) : (
        <div className="scrollbar-thin overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 w-48 border-b border-r border-slate-200 bg-slate-50/95 p-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500 backdrop-blur">Attribute</th>
                {models.map((model) => (
                  <th key={model.slug} className="min-w-[210px] border-b border-slate-200 p-4 text-left align-top">
                    <div className="flex items-start gap-2.5">
                      <Avatar name={model.lab.name} color={model.lab.color} size="sm" />
                      <div className="min-w-0 flex-1">
                        <Link href={modelHref(model.slug)} className="block text-sm font-semibold leading-5 text-slate-900 hover:text-indigo-600">{model.name}</Link>
                        <span className="text-[11px] text-slate-400">{model.lab.name}</span>
                      </div>
                      <button onClick={() => remove(model.slug)} className="rounded p-1 text-slate-300 hover:bg-slate-100 hover:text-rose-500" aria-label={`Remove ${model.name}`}>
                        <span className="text-base leading-none">×</span>
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={row.label} className={rowIndex % 2 === 1 ? 'bg-slate-50/40' : ''}>
                  <th className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-4 py-3 text-left text-xs font-medium text-slate-500">{row.label}</th>
                  {row.values.map((value, index) => (
                    <td key={`${row.label}-${models[index]?.slug}-${index}`} className="border-b border-slate-100 px-4 py-3 align-top text-slate-800">
                      <div className={cn('flex flex-col', value.best && 'text-emerald-700')}>{value.text}</div>
                      {value.sub && <span className="mt-0.5 block text-[10px] text-slate-400">{value.sub}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

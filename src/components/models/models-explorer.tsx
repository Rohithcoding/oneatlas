'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LayoutGrid, List, Search, X } from 'lucide-react';
import type { ModelsResponse } from '@/lib/types';
import type { ModelQuery } from '@/lib/validation';
import { cn, formatCompact } from '@/lib/utils';
import { ModelFilters } from './model-filters';
import { ModelTable } from './model-table';
import { ModelGrid } from './model-grid';
import { EmptyState, Pagination } from '@/components/ui/misc';

export function queryToParams(query: ModelQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.lab) params.set('lab', query.lab);
  if (query.provider) params.set('provider', query.provider);
  if (query.type) params.set('type', query.type);
  if (query.capabilities.length) params.set('capabilities', query.capabilities.join(','));
  if (query.minContext) params.set('minContext', String(query.minContext));
  if (query.maxPrice !== undefined) params.set('maxPrice', String(query.maxPrice));
  if (query.free) params.set('free', 'true');
  if (query.openWeights) params.set('openWeights', 'true');
  if (!query.hideDeprecated) params.set('hideDeprecated', 'false');
  if (query.sort !== 'released') params.set('sort', query.sort);
  if (query.page > 1) params.set('page', String(query.page));
  return params;
}

async function fetchModels(params: URLSearchParams): Promise<ModelsResponse> {
  const response = await fetch(`/api/models?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to load models');
  return response.json();
}

export function ModelsExplorer({
  initialQuery,
  initialData,
}: {
  initialQuery: ModelQuery;
  initialData: ModelsResponse;
}) {
  const [query, setQuery] = useState<ModelQuery>(initialQuery);
  const [input, setInput] = useState(initialQuery.q);
  const [view, setView] = useState<'table' | 'grid'>('table');
  const initialKey = useMemo(() => queryToParams(initialQuery).toString(), [initialQuery]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery((current) => (current.q === input ? current : { ...current, q: input, page: 1 }));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [input]);

  useEffect(() => {
    const params = queryToParams(query).toString();
    const url = params ? `/models?${params}` : '/models';
    window.history.replaceState(null, '', url);
  }, [query]);

  const key = useMemo(() => queryToParams(query).toString(), [query]);
  const { data, isFetching, isError } = useQuery({
    queryKey: ['models', key],
    queryFn: () => fetchModels(new URLSearchParams(key)),
    initialData: key === initialKey ? initialData : undefined,
    placeholderData: (previous) => previous,
  });

  const result = data ?? initialData;

  function patch(next: Partial<ModelQuery>) {
    setQuery((current) => ({ ...current, ...next, page: next.page ?? 1 }));
  }

  function reset() {
    setQuery((current) => ({
      ...current,
      q: '', lab: '', provider: '', type: '', capabilities: [],
      minContext: 0, maxPrice: undefined, free: false, openWeights: false,
      hideDeprecated: true, sort: 'released', page: 1,
    }));
    setInput('');
  }

  const activeChips: Array<{ label: string; clear: () => void }> = [];
  if (query.lab) {
    const lab = result.meta.facets.labs.find((item) => item.value === query.lab);
    activeChips.push({ label: `Lab: ${lab?.label ?? query.lab}`, clear: () => patch({ lab: '' }) });
  }
  if (query.provider) {
    const provider = result.meta.facets.providers.find((item) => item.value === query.provider);
    activeChips.push({ label: `Provider: ${provider?.label ?? query.provider}`, clear: () => patch({ provider: '' }) });
  }
  if (query.type) activeChips.push({ label: `Type: ${query.type}`, clear: () => patch({ type: '' }) });
  query.capabilities.forEach((cap) =>
    activeChips.push({ label: cap === 'tools' ? 'Tool calling' : cap, clear: () => patch({ capabilities: query.capabilities.filter((item) => item !== cap) }) })
  );
  if (query.minContext) activeChips.push({ label: `${formatCompact(query.minContext)}+ context`, clear: () => patch({ minContext: 0 }) });
  if (query.maxPrice !== undefined) activeChips.push({ label: `≤ $${query.maxPrice}/1M`, clear: () => patch({ maxPrice: undefined }) });
  if (query.free) activeChips.push({ label: 'Free', clear: () => patch({ free: false }) });
  if (query.openWeights) activeChips.push({ label: 'Open weights', clear: () => patch({ openWeights: false }) });

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Catalogue</p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Explore AI models</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Search {formatCompact(result.meta.total)} models by specification, price and capability. Compare up to five side by side.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <ModelFilters query={query} facets={result.meta.facets} onChange={patch} onReset={reset} />

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Search by model name, lab or description…"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
              {input && (
                <button onClick={() => setInput('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700" aria-label="Clear search">
                  <X className="size-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={query.sort}
                onChange={(event) => patch({ sort: event.target.value as ModelQuery['sort'] })}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-400"
                aria-label="Sort models"
              >
                <option value="released">Newest first</option>
                <option value="intelligence">Highest index</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="context">Largest context</option>
                <option value="name">Name A–Z</option>
              </select>
              <div className="flex h-10 rounded-lg border border-slate-200 bg-white p-1">
                {([
                  ['table', List],
                  ['grid', LayoutGrid],
                ] as const).map(([value, Icon]) => (
                  <button
                    key={value}
                    onClick={() => setView(value)}
                    aria-label={`${value} view`}
                    className={cn(
                      'flex w-8 items-center justify-center rounded-md transition',
                      view === value ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-700'
                    )}
                  >
                    <Icon className="size-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">
              <span className="font-semibold tabular-nums text-slate-900">{formatCompact(result.meta.total)}</span> models
              {isFetching && <span className="ml-2 text-indigo-500">updating…</span>}
            </span>
            {activeChips.map((chip) => (
              <button key={chip.label} onClick={chip.clear} className="flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100">
                {chip.label} <X className="size-3" />
              </button>
            ))}
          </div>

          {isError ? (
            <EmptyState title="Couldn't load models" description="Something went wrong contacting the catalogue API. Please try again." action={{ label: 'Reload', href: '/models' }} />
          ) : result.data.length === 0 ? (
            <EmptyState title="No models match those filters" description="Try removing a filter or broadening your search term." action={{ label: 'Clear all filters', href: '/models' }} />
          ) : view === 'table' ? (
            <ModelTable models={result.data} sort={query.sort} onSort={(sort) => patch({ sort: sort === 'price-asc' && query.sort.startsWith('price') ? 'price-desc' : sort })} loading={isFetching} />
          ) : (
            <ModelGrid models={result.data} />
          )}

          <Pagination page={result.meta.page} totalPages={result.meta.totalPages} onPageChange={(page) => setQuery((current) => ({ ...current, page }))} />
        </div>
      </div>
    </div>
  );
}

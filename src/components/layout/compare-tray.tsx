'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, GitCompareArrows, X } from 'lucide-react';
import type { ModelDetail } from '@/lib/types';
import { useCompare } from '@/hooks/use-compare';

async function fetchCompare(ids: string[]): Promise<ModelDetail[]> {
  const response = await fetch(`/api/compare?models=${encodeURIComponent(ids.join(','))}`);
  if (!response.ok) return [];
  return response.json();
}

export function CompareTray() {
  const { ids, remove, clear } = useCompare();
  const router = useRouter();
  const pathname = usePathname();

  const { data } = useQuery({
    queryKey: ['compare-tray', ids.join(',')],
    queryFn: () => fetchCompare(ids),
    enabled: ids.length > 0,
  });

  if (ids.length === 0 || pathname === '/compare') return null;

  const query = ids.join(',');

  return (
    <div className="animate-fade-in fixed bottom-4 left-1/2 z-30 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 p-2 pl-3 shadow-xl shadow-slate-900/10 backdrop-blur-xl">
        <GitCompareArrows className="hidden size-4 shrink-0 text-indigo-600 sm:block" />
        <div className="scrollbar-thin flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
          {ids.map((id) => {
            const model = data?.find((item) => item.slug === id);
            return (
              <span key={id} className="group flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-100 py-1 pl-2.5 pr-1 text-xs font-medium text-slate-700">
                <span className="max-w-32 truncate">{model?.name ?? id.split('/')[1] ?? id}</span>
                <button onClick={() => remove(id)} className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700" aria-label={`Remove ${id}`}>
                  <X className="size-3" />
                </button>
              </span>
            );
          })}
        </div>
        <button onClick={clear} className="hidden text-xs text-slate-400 hover:text-slate-700 sm:block">Clear</button>
        <button
          onClick={() => router.push(`/compare?models=${encodeURIComponent(query)}`)}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-600"
        >
          Compare <span className="rounded bg-white/20 px-1 text-[10px]">{ids.length}</span>
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

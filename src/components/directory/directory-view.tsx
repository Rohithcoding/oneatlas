'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Building2, Globe2, Layers3, Search, Server } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { cn, formatCompact } from '@/lib/utils';

export interface DirectoryItem {
  slug: string;
  name: string;
  color: string;
  description?: string;
  website: string | null;
  modelCount: number;
  country?: string | null;
  founded?: number | null;
  category?: string;
  region?: string | null;
}

async function fetchDirectory(kind: 'labs' | 'providers', q: string): Promise<DirectoryItem[]> {
  const response = await fetch(`/api/${kind}?q=${encodeURIComponent(q)}`);
  if (!response.ok) throw new Error('Failed to load directory');
  return response.json();
}

export function DirectoryView({
  kind,
  initialItems,
  initialQ = '',
  title,
  description,
}: {
  kind: 'labs' | 'providers';
  initialItems: DirectoryItem[];
  initialQ?: string;
  title: string;
  description: string;
}) {
  const [input, setInput] = useState(initialQ);
  const [q, setQ] = useState(initialQ);

  useEffect(() => {
    const timer = window.setTimeout(() => setQ(input), 250);
    return () => window.clearTimeout(timer);
  }, [input]);

  useEffect(() => {
    window.history.replaceState(null, '', q ? `/${kind}?q=${encodeURIComponent(q)}` : `/${kind}`);
  }, [q, kind]);

  const { data, isFetching } = useQuery({
    queryKey: [kind, q],
    queryFn: () => fetchDirectory(kind, q),
    initialData: q === initialQ ? initialItems : undefined,
    placeholderData: (previous) => previous,
  });

  const items = data ?? initialItems;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Directory</p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">{description}</p>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={`Search ${kind}…`}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        {isFetching && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-indigo-500">updating…</span>}
      </div>

      <p className="mb-3 text-xs text-slate-500"><span className="font-semibold text-slate-900">{formatCompact(items.length)}</span> {kind}</p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/${kind}/${item.slug}`}
            className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition hover:border-indigo-200 hover:shadow-md hover:shadow-slate-900/5"
          >
            <div className="flex items-start gap-3">
              <Avatar name={item.name} color={item.color} size="lg" />
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-semibold text-slate-900 group-hover:text-indigo-600">{item.name}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                  {kind === 'labs' ? <Building2 className="size-3" /> : <Server className="size-3" />}
                  {item.category ?? (item.country || 'AI research lab')}
                </p>
              </div>
              <ArrowUpRight className="size-4 shrink-0 text-slate-300 transition group-hover:text-indigo-500" />
            </div>
            {item.description && <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">{item.description}</p>}
            <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5"><Layers3 className="size-3" /> {item.modelCount} models</span>
              {item.region && <span className="flex items-center gap-1"><Globe2 className="size-3" /> {item.region}</span>}
              {item.founded && <span>est. {item.founded}</span>}
            </div>
          </Link>
        ))}
      </div>

      {items.length === 0 && (
        <div className={cn('rounded-xl border border-dashed border-slate-300 py-16 text-center text-sm text-slate-500')}>
          No {kind} found for “{q}”.
        </div>
      )}
    </div>
  );
}

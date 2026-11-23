'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Building2, Cpu, Loader2, Search } from 'lucide-react';
import type { SearchResult } from '@/lib/types';
import { Avatar } from '@/components/ui/avatar';
import { cn, formatContext, formatPrice, labHref, modelHref, providerHref } from '@/lib/utils';

async function fetchSearch(q: string): Promise<SearchResult> {
  const response = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=6`);
  if (!response.ok) throw new Error('Search failed');
  return response.json();
}

export function SearchPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);

  const { data, isFetching } = useQuery({
    queryKey: ['search', q],
    queryFn: () => fetchSearch(q),
    enabled: q.trim().length > 0,
  });

  const results: Array<{ key: string; label: string; sub: string; href: string; color: string }> = [
    ...(data?.models ?? []).map((model) => ({
      key: model.slug,
      label: model.name,
      sub: `${model.lab.name} · ${formatContext(model.contextWindow)} ctx · ${formatPrice(model.inputPrice, model.free)}`,
      href: modelHref(model.slug),
      color: model.lab.color,
    })),
    ...(data?.labs ?? []).map((lab) => ({
      key: `lab-${lab.slug}`,
      label: lab.name,
      sub: `Lab · ${lab.modelCount} models`,
      href: labHref(lab.slug),
      color: lab.color,
    })),
    ...(data?.providers ?? []).map((provider) => ({
      key: `provider-${provider.slug}`,
      label: provider.name,
      sub: `Provider · ${provider.modelCount} models`,
      href: providerHref(provider.slug),
      color: provider.color,
    })),
  ];

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previous;
    };
  }, []);

  function go(href: string) {
    onClose();
    router.push(href);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') return onClose();
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((value) => Math.min(value + 1, results.length - 1));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((value) => Math.max(value - 1, 0));
    }
    if (event.key === 'Enter' && results[active]) {
      event.preventDefault();
      go(results[active].href);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh]" role="dialog" aria-modal="true" aria-label="Search OneAtlas">
      <button aria-label="Close search" className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="animate-scale-in relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10" onKeyDown={onKeyDown}>
        <div className="flex items-center gap-3 border-b border-slate-200 px-4">
          <Search className="size-4.5 shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            value={q}
            onChange={(event) => {
              setQ(event.target.value);
              setActive(0);
            }}
            placeholder="Search models, labs, providers…"
            className="h-14 flex-1 bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
          />
          {isFetching ? <Loader2 className="size-4 animate-spin text-slate-400" /> : <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-400">ESC</kbd>}
        </div>

        <div className="scrollbar-thin max-h-[52vh] overflow-y-auto p-2">
          {q.trim().length === 0 ? (
            <div className="px-3 py-10 text-center">
              <Cpu className="mx-auto size-6 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-700">Search the entire model catalogue</p>
              <p className="mt-1 text-xs text-slate-500">Try “reasoning”, “Claude”, “vision” or “Groq”</p>
            </div>
          ) : results.length === 0 && !isFetching ? (
            <div className="px-3 py-12 text-center text-sm text-slate-500">No results for “{q}”</div>
          ) : (
            <div className="space-y-0.5">
              {results.map((result, index) => (
                <button
                  key={result.key}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => go(result.href)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition',
                    index === active ? 'bg-indigo-50' : 'hover:bg-slate-50'
                  )}
                >
                  <Avatar name={result.label} color={result.color} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-900">{result.label}</span>
                    <span className="block truncate text-xs text-slate-500">{result.sub}</span>
                  </span>
                  <ArrowRight className="size-3.5 shrink-0 text-slate-300" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 border-t border-slate-100 bg-slate-50/60 px-4 py-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><Building2 className="size-3" /> Models, labs & providers</span>
          <span className="ml-auto hidden sm:inline">↑↓ navigate · ↵ open</span>
        </div>
      </div>
    </div>
  );
}

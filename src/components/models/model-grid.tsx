'use client';

import Link from 'next/link';
import { Check, Layers3 } from 'lucide-react';
import type { ModelListItem } from '@/lib/types';
import { useCompare } from '@/hooks/use-compare';
import { Avatar } from '@/components/ui/avatar';
import { CapabilityPills } from '@/components/ui/badge';
import { cn, formatContext, formatDate, formatPrice, modelHref } from '@/lib/utils';

export function ModelGrid({ models }: { models: ModelListItem[] }) {
  const { toggle, isSelected } = useCompare();

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {models.map((model) => {
        const selected = isSelected(model.slug);
        return (
          <article key={model.id} className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5">
            <div className="flex items-start gap-3">
              <Avatar name={model.lab.name} color={model.lab.color} size="md" />
              <div className="min-w-0 flex-1">
                <Link href={modelHref(model.slug)} className="block truncate font-semibold text-slate-900 hover:text-indigo-600">
                  {model.name}
                </Link>
                <p className="mt-0.5 text-xs text-slate-500">
                  <Link href={`/labs/${model.lab.slug}`} className="hover:text-indigo-600">{model.lab.name}</Link>
                  {' · '}
                  <span className="capitalize">{model.type}</span>
                </p>
              </div>
              <button
                onClick={() => toggle(model.slug)}
                aria-label={selected ? 'Remove from comparison' : 'Add to comparison'}
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-lg border transition',
                  selected
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-600'
                )}
              >
                {selected ? <Check className="size-3.5" /> : <span className="text-base leading-none">+</span>}
              </button>
            </div>

            <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">{model.description}</p>

            <CapabilityPills capabilities={model.capabilities} limit={4} className="mt-3" />

            <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-xs">
              <div>
                <dt className="text-slate-400">Context</dt>
                <dd className="mt-0.5 font-mono font-medium text-slate-800">{formatContext(model.contextWindow)}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Input / 1M</dt>
                <dd className="mt-0.5 font-mono font-medium text-slate-800">{formatPrice(model.inputPrice, model.free)}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Output / 1M</dt>
                <dd className="mt-0.5 font-mono font-medium text-slate-800">{formatPrice(model.outputPrice, model.free)}</dd>
              </div>
            </dl>

            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Layers3 className="size-3" /> {model.providerCount} providers
              </span>
              <span>{formatDate(model.releasedAt)}</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}

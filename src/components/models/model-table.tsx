'use client';

import Link from 'next/link';
import { ArrowDown, ArrowUp, Boxes, Brain, Braces, Check, Eye, Wrench } from 'lucide-react';
import type { ModelListItem } from '@/lib/types';
import { useCompare } from '@/hooks/use-compare';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn, formatContext, formatDate, formatPrice, modelHref } from '@/lib/utils';
import type { ModelQuery } from '@/lib/validation';

const CAPABILITY_ICONS = [
  { key: 'reasoning', label: 'Reasoning', Icon: Brain },
  { key: 'toolCalling', label: 'Tool calling', Icon: Wrench },
  { key: 'structuredOutput', label: 'Structured output', Icon: Braces },
  { key: 'vision', label: 'Vision', Icon: Eye },
  { key: 'openWeights', label: 'Open weights', Icon: Boxes },
] as const;

function SortHeader({
  label,
  field,
  sort,
  onSort,
  className,
}: {
  label: string;
  field: ModelQuery['sort'];
  sort: ModelQuery['sort'];
  onSort: (field: ModelQuery['sort']) => void;
  className?: string;
}) {
  const active = sort === field || (field === 'price-asc' && sort.startsWith('price'));
  const asc = sort === 'price-asc' || sort === 'name';
  return (
    <button
      onClick={() => onSort(field)}
      className={cn('group inline-flex items-center gap-1 text-left transition hover:text-slate-900', active && 'text-slate-900', className)}
    >
      {label}
      {active ? (
        asc ? <ArrowUp className="size-3 text-indigo-500" /> : <ArrowDown className="size-3 text-indigo-500" />
      ) : (
        <ArrowDown className="size-3 text-slate-300 opacity-0 transition group-hover:opacity-100" />
      )}
    </button>
  );
}

export function ModelTable({
  models,
  sort,
  onSort,
  loading,
}: {
  models: ModelListItem[];
  sort: ModelQuery['sort'];
  onSort: (field: ModelQuery['sort']) => void;
  loading: boolean;
}) {
  const { toggle, isSelected } = useCompare();

  return (
    <div className={cn('overflow-hidden rounded-xl border border-slate-200 bg-white transition-opacity', loading && 'opacity-60')}>
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-semibold"><SortHeader label="Model" field="name" sort={sort} onSort={onSort} /></th>
              <th className="px-3 py-3 font-semibold">Providers</th>
              <th className="px-3 py-3 font-semibold"><SortHeader label="Context" field="context" sort={sort} onSort={onSort} /></th>
              <th className="px-3 py-3 font-semibold">Output</th>
              <th className="px-3 py-3 font-semibold">Capabilities</th>
              <th className="px-3 py-3 font-semibold"><SortHeader label="Index" field="intelligence" sort={sort} onSort={onSort} /></th>
              <th className="px-3 py-3 font-semibold"><SortHeader label="Input / 1M" field="price-asc" sort={sort} onSort={onSort} /></th>
              <th className="px-3 py-3 font-semibold">Output / 1M</th>
              <th className="px-3 py-3 font-semibold"><SortHeader label="Released" field="released" sort={sort} onSort={onSort} /></th>
              <th className="px-3 py-3 text-right font-semibold">Compare</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {models.map((model) => {
              const selected = isSelected(model.slug);
              return (
                <tr key={model.id} className="group transition-colors hover:bg-slate-50/70">
                  <td className="max-w-[300px] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={model.lab.name} color={model.lab.color} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Link href={modelHref(model.slug)} className="truncate font-medium text-slate-900 hover:text-indigo-600">
                            {model.name}
                          </Link>
                          {model.free && <Badge tone="emerald">Free</Badge>}
                          {model.deprecated && <Badge tone="rose">Legacy</Badge>}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                          <Link href={`/labs/${model.lab.slug}`} className="hover:text-indigo-600">{model.lab.name}</Link>
                          <span className="text-slate-300">·</span>
                          <span className="capitalize">{model.type}</span>
                          {model.parameters && <><span className="text-slate-300">·</span><span>{model.parameters}</span></>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <div className="flex -space-x-1.5">
                        {model.topProviders.map((provider) => (
                          <Avatar key={provider.slug} name={provider.name} color={provider.color} size="sm" className="ring-2 ring-white" />
                        ))}
                      </div>
                      <span className="ml-1 text-xs font-medium tabular-nums text-slate-500">{model.providerCount}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs tabular-nums text-slate-700">{formatContext(model.contextWindow)}</td>
                  <td className="px-3 py-3 font-mono text-xs tabular-nums text-slate-500">{formatContext(model.maxOutput)}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      {CAPABILITY_ICONS.map(({ key, label, Icon }) => {
                        const active = model.capabilities[key];
                        return (
                          <span
                            key={key}
                            title={`${label}: ${active ? 'yes' : 'no'}`}
                            className={cn(
                              'flex size-6 items-center justify-center rounded-md',
                              active ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-300'
                            )}
                          >
                            <Icon className="size-3.5" />
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {model.intelligence === null ? (
                      <span className="text-slate-300">—</span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-8 font-mono text-xs font-semibold tabular-nums text-slate-800">{model.intelligence.toFixed(1)}</span>
                        <span className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-100">
                          <span className="block h-full rounded-full bg-indigo-500" style={{ width: `${model.intelligence}%` }} />
                        </span>
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 font-mono text-xs tabular-nums text-slate-700">{formatPrice(model.inputPrice, model.free)}</td>
                  <td className="px-3 py-3 font-mono text-xs tabular-nums text-slate-500">{formatPrice(model.outputPrice, model.free)}</td>
                  <td className="px-3 py-3 text-xs text-slate-500">{formatDate(model.releasedAt)}</td>
                  <td className="px-3 py-3 text-right">
                    <button
                      onClick={() => toggle(model.slug)}
                      title={selected ? 'Remove from comparison' : 'Add to comparison'}
                      aria-label={selected ? 'Remove from comparison' : 'Add to comparison'}
                      className={cn(
                        'inline-flex size-7 items-center justify-center rounded-lg border transition',
                        selected
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-200 bg-white text-slate-400 hover:border-indigo-300 hover:text-indigo-600'
                      )}
                    >
                      {selected ? <Check className="size-3.5" /> : <span className="text-base leading-none">+</span>}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

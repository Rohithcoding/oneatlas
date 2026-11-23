'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown, RotateCcw } from 'lucide-react';
import type { ModelsResponse } from '@/lib/types';
import { cn } from '@/lib/utils';
import type { ModelQuery } from '@/lib/validation';

function Section({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 py-4 last:border-0">
      <button onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
        <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

function FilterOption({
  label,
  count,
  active,
  color,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  color?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] transition hover:bg-slate-50"
    >
      <span
        className={cn(
          'flex size-3.5 shrink-0 items-center justify-center rounded-[4px] border transition',
          active ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 bg-white group-hover:border-slate-400'
        )}
      >
        {active && (
          <svg viewBox="0 0 10 10" className="size-2.5 text-white" fill="none"><path d="M1.5 5l2.2 2.2L8.5 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        )}
      </span>
      {color && <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />}
      <span className={cn('min-w-0 flex-1 truncate', active ? 'font-medium text-slate-900' : 'text-slate-600')}>{label}</span>
      {count !== undefined && <span className="text-[11px] tabular-nums text-slate-400">{count}</span>}
    </button>
  );
}

export function ModelFilters({
  query,
  facets,
  onChange,
  onReset,
}: {
  query: ModelQuery;
  facets: ModelsResponse['meta']['facets'];
  onChange: (patch: Partial<ModelQuery>) => void;
  onReset: () => void;
}) {
  const hasFilters =
    Boolean(query.lab || query.provider || query.type || query.minContext || query.maxPrice || query.free || query.openWeights || query.capabilities.length) ||
    !query.hideDeprecated;

  const capabilities = [
    { value: 'reasoning', label: 'Reasoning' },
    { value: 'tools', label: 'Tool calling' },
    { value: 'json', label: 'Structured output' },
    { value: 'vision', label: 'Vision input' },
    { value: 'openWeights', label: 'Open weights' },
  ];

  function toggleCapability(value: string) {
    const next = query.capabilities.includes(value)
      ? query.capabilities.filter((item) => item !== value)
      : [...query.capabilities, value];
    onChange({ capabilities: next });
  }

  return (
    <aside className="w-full shrink-0 lg:w-60">
      <div className="rounded-xl border border-slate-200 bg-white px-3">
        <div className="flex items-center justify-between py-4">
          <span className="text-sm font-semibold text-slate-900">Filters</span>
          {hasFilters && (
            <button onClick={onReset} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800">
              <RotateCcw className="size-3" /> Reset
            </button>
          )}
        </div>

        <Section title="Lab">
          <div className="scrollbar-thin max-h-52 space-y-0.5 overflow-y-auto pr-1">
            {facets.labs.slice(0, 14).map((lab) => (
              <FilterOption
                key={lab.value}
                label={lab.label}
                count={lab.count}
                color={lab.color}
                active={query.lab === lab.value}
                onClick={() => onChange({ lab: query.lab === lab.value ? '' : lab.value })}
              />
            ))}
          </div>
        </Section>

        <Section title="Provider">
          <div className="scrollbar-thin max-h-52 space-y-0.5 overflow-y-auto pr-1">
            {facets.providers.slice(0, 14).map((provider) => (
              <FilterOption
                key={provider.value}
                label={provider.label}
                count={provider.count}
                color={provider.color}
                active={query.provider === provider.value}
                onClick={() => onChange({ provider: query.provider === provider.value ? '' : provider.value })}
              />
            ))}
          </div>
        </Section>

        <Section title="Model type">
          <div className="space-y-0.5">
            {facets.types.map((type) => (
              <FilterOption
                key={type.value}
                label={type.label}
                count={type.count}
                active={query.type === type.value}
                onClick={() => onChange({ type: query.type === type.value ? '' : type.value })}
              />
            ))}
          </div>
        </Section>

        <Section title="Capabilities">
          <div className="space-y-0.5">
            {capabilities.map((capability) => (
              <FilterOption
                key={capability.value}
                label={capability.label}
                active={query.capabilities.includes(capability.value)}
                onClick={() => toggleCapability(capability.value)}
              />
            ))}
          </div>
        </Section>

        <Section title="Context window">
          <select
            value={query.minContext}
            onChange={(event) => onChange({ minContext: Number(event.target.value) })}
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[13px] text-slate-700 outline-none focus:border-indigo-400"
          >
            <option value={0}>Any size</option>
            <option value={32000}>32K+</option>
            <option value={128000}>128K+</option>
            <option value={262144}>262K+</option>
            <option value={1000000}>1M+</option>
          </select>
        </Section>

        <Section title="Max input price">
          <select
            value={query.maxPrice ?? ''}
            onChange={(event) => onChange({ maxPrice: event.target.value ? Number(event.target.value) : undefined })}
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[13px] text-slate-700 outline-none focus:border-indigo-400"
          >
            <option value="">Any price</option>
            <option value={0.1}>≤ $0.10 / 1M</option>
            <option value={0.5}>≤ $0.50 / 1M</option>
            <option value={1}>≤ $1 / 1M</option>
            <option value={5}>≤ $5 / 1M</option>
            <option value={20}>≤ $20 / 1M</option>
          </select>
        </Section>

        <Section title="Other">
          <div className="space-y-0.5">
            {([
              ['free', 'Free models only'],
              ['hideDeprecated', 'Hide deprecated'],
            ] as const).map(([key, label]) => (
              <FilterOption
                key={key}
                label={label}
                active={query[key]}
                onClick={() => onChange({ [key]: !query[key] } as Partial<ModelQuery>)}
              />
            ))}
          </div>
        </Section>
      </div>
    </aside>
  );
}

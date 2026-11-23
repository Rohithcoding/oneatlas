import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { Capabilities } from '@/lib/types';

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'indigo' | 'emerald' | 'amber' | 'sky' | 'rose';
  className?: string;
}) {
  const tones = {
    neutral: 'bg-slate-100 text-slate-600 ring-slate-200/70',
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200/70',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200/70',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200/70',
    sky: 'bg-sky-50 text-sky-700 ring-sky-200/70',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200/70',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset whitespace-nowrap',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function CapabilityPills({
  capabilities,
  limit,
  className,
}: {
  capabilities: Capabilities;
  limit?: number;
  className?: string;
}) {
  const items: Array<{ label: string; active: boolean }> = [
    { label: 'Reasoning', active: capabilities.reasoning },
    { label: 'Tools', active: capabilities.toolCalling },
    { label: 'JSON', active: capabilities.structuredOutput },
    { label: 'Vision', active: capabilities.vision },
    { label: 'Weights', active: capabilities.openWeights },
  ];
  const shown = limit ? items.slice(0, limit) : items;
  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)}>
      {shown.map((item) =>
        item.active ? (
          <Badge key={item.label} tone="indigo">
            {item.label}
          </Badge>
        ) : null
      )}
    </div>
  );
}

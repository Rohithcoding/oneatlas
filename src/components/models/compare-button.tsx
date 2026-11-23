'use client';

import { Check, GitCompareArrows } from 'lucide-react';
import { useCompare } from '@/hooks/use-compare';
import { cn } from '@/lib/utils';

export function CompareButton({ slug, className }: { slug: string; className?: string }) {
  const { toggle, isSelected } = useCompare();
  const selected = isSelected(slug);

  return (
    <button
      onClick={() => toggle(slug)}
      className={cn(
        'inline-flex h-9 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition',
        selected
          ? 'border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700'
          : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-600',
        className
      )}
    >
      {selected ? <Check className="size-4" /> : <GitCompareArrows className="size-4" />}
      {selected ? 'Added to compare' : 'Add to compare'}
    </button>
  );
}

import Link from 'next/link';
import type { ModelListItem } from '@/lib/types';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CompareButton } from './compare-button';
import { formatContext, formatDate, formatPrice, modelHref } from '@/lib/utils';

export function ModelListCompact({ models, showLab = true }: { models: ModelListItem[]; showLab?: boolean }) {
  return (
    <div className="divide-y divide-slate-100">
      {models.map((model) => (
        <div key={model.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5 transition hover:bg-slate-50/70 sm:flex-nowrap">
          <Avatar name={model.lab.name} color={model.lab.color} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Link href={modelHref(model.slug)} className="truncate text-sm font-semibold text-slate-900 hover:text-indigo-600">{model.name}</Link>
              {model.free && <Badge tone="emerald">Free</Badge>}
              {model.capabilities.openWeights && <Badge tone="neutral">Open</Badge>}
            </div>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {showLab && <><Link href={`/labs/${model.lab.slug}`} className="hover:text-indigo-600">{model.lab.name}</Link> · </>}
              <span className="capitalize">{model.type}</span> · {formatDate(model.releasedAt)}
            </p>
          </div>
          <div className="hidden items-center gap-5 font-mono text-xs text-slate-600 sm:flex">
            <span className="w-14 text-right" title="Context window">{formatContext(model.contextWindow)}</span>
            <span className="w-16 text-right" title="Input price per 1M tokens">{formatPrice(model.inputPrice, model.free)}</span>
            {model.intelligence !== null && <span className="w-10 text-right font-semibold text-slate-800" title="Intelligence index">{model.intelligence.toFixed(1)}</span>}
          </div>
          <CompareButton slug={model.slug} className="ml-auto h-8 shrink-0 px-2.5 text-xs sm:ml-0" />
        </div>
      ))}
    </div>
  );
}

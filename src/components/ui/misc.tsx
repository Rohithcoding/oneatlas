import Link from 'next/link';
import { ChevronLeft, ChevronRight, Loader2, SearchX } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-slate-100', className)} />;
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('size-4 animate-spin', className)} />;
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        <SearchX className="size-5" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-5 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
    return start + index;
  }).filter((value) => value >= 1 && value <= totalPages);

  return (
    <nav className="flex items-center justify-center gap-1.5 py-6" aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </button>
      {pages.map((value) => (
        <button
          key={value}
          onClick={() => onPageChange(value)}
          className={cn(
            'size-8 rounded-lg text-sm font-medium transition',
            value === page
              ? 'bg-slate-900 text-white'
              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          )}
        >
          {value}
        </button>
      ))}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}

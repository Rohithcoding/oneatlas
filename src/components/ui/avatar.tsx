import { cn, initials } from '@/lib/utils';

export function Avatar({
  name,
  color,
  size = 'md',
  className,
}: {
  name: string;
  color?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizes = { sm: 'size-6 text-[10px]', md: 'size-8 text-[11px]', lg: 'size-12 text-sm' };
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-lg font-semibold text-white ring-1 ring-black/5',
        sizes[size],
        className
      )}
      style={{ backgroundColor: color ?? '#64748b' }}
    >
      {initials(name)}
    </span>
  );
}

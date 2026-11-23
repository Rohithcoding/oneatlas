'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchPalette } from './search-palette';

const NAV = [
  { label: 'Models', href: '/models' },
  { label: 'Rankings', href: '/rankings' },
  { label: 'Benchmarks', href: '/benchmarks' },
  { label: 'Labs', href: '/labs' },
  { label: 'Providers', href: '/providers' },
];

export function Header() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen((value) => !value);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="OneAtlas home">
            <span className="relative flex size-7 items-center justify-center">
              <span className="absolute size-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm shadow-indigo-500/30" />
              <span className="absolute size-3 rounded-full border-[1.5px] border-white/90" />
              <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full border-2 border-white bg-amber-400" />
            </span>
            <span className="text-[17px] font-semibold tracking-tight text-slate-900">
              one<span className="text-indigo-600">atlas</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-lg px-3 py-2 text-[13px] font-medium transition-colors',
                    active ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="group flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-400 shadow-sm transition hover:border-slate-300 hover:shadow sm:w-56 sm:px-3"
            >
              <Search className="size-4 text-slate-400 group-hover:text-slate-600" />
              <span className="hidden sm:inline">Search models, labs…</span>
              <kbd className="ml-auto hidden rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-sans text-[10px] text-slate-400 sm:inline">
                ⌘K
              </kbd>
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hidden size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 sm:flex"
              aria-label="GitHub"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-4.5" aria-hidden>
                <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.54-1.39-1.33-1.76-1.33-1.76-1.08-.74.08-.73.08-.73 1.2.09 1.83 1.23 1.83 1.23 1.06 1.82 2.78 1.29 3.46.99.1-.77.41-1.29.75-1.59-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.4 1.24-3.24-.12-.31-.54-1.53.12-3.19 0 0 1.01-.33 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.56 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.19.77.84 1.24 1.92 1.24 3.24 0 4.63-2.8 5.65-5.48 5.95.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z" />
              </svg>
            </a>
            <button
              onClick={() => setMobileOpen((value) => !value)}
              className="flex size-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="animate-fade-in border-t border-slate-200 bg-white px-4 py-2 lg:hidden">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block rounded-lg px-3 py-2.5 text-sm font-medium',
                  pathname.startsWith(item.href) ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {searchOpen && <SearchPalette onClose={() => setSearchOpen(false)} />}
    </>
  );
}

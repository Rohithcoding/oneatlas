import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50/60">
      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 text-[10px] font-bold text-white">OA</span>
              <span className="text-sm font-semibold text-slate-900">oneatlas</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Every AI model, side by side. Specs, pricing, capabilities and providers in one searchable catalogue.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Explore</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li><Link href="/models" className="hover:text-indigo-600">Models</Link></li>
                <li><Link href="/rankings" className="hover:text-indigo-600">Rankings</Link></li>
                <li><Link href="/benchmarks" className="hover:text-indigo-600">Benchmarks</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Directory</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li><Link href="/labs" className="hover:text-indigo-600">AI labs</Link></li>
                <li><Link href="/providers" className="hover:text-indigo-600">Providers</Link></li>
                <li><Link href="/compare" className="hover:text-indigo-600">Compare</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Data</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li><Link href="/api/models" prefetch={false} className="hover:text-indigo-600">Models API</Link></li>
                <li><Link href="/api/stats" prefetch={false} className="hover:text-indigo-600">Stats API</Link></li>
                <li><Link href="/api/rankings" prefetch={false} className="hover:text-indigo-600">Rankings API</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} OneAtlas. Built for model discovery.</p>
          <p>Catalogue data is illustrative and refreshed periodically.</p>
        </div>
      </div>
    </footer>
  );
}

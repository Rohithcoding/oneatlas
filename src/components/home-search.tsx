'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search } from 'lucide-react';

export function HomeSearch() {
  const router = useRouter();
  const [value, setValue] = useState('');

  function submit(event: FormEvent) {
    event.preventDefault();
    router.push(value.trim() ? `/models?q=${encodeURIComponent(value.trim())}` : '/models');
  }

  return (
    <form onSubmit={submit} className="flex w-full max-w-xl items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-900/5 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50">
      <Search className="ml-2.5 size-4 shrink-0 text-slate-400" />
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search models, labs, providers…"
        className="h-9 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
      />
      <button type="submit" className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 text-sm font-medium text-white transition hover:bg-indigo-600">
        Search <ArrowRight className="size-3.5" />
      </button>
    </form>
  );
}

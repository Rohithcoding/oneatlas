'use client';

import { createContext, useCallback, useContext, useSyncExternalStore, type ReactNode } from 'react';

const STORAGE_KEY = 'oneatlas:compare';
const MAX_MODELS = 5;
const EMPTY_IDS: string[] = [];

interface CompareContextValue {
  ids: string[];
  setIds: (ids: string[]) => void;
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
  isSelected: (slug: string) => boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

// A tiny external store backed by localStorage. useSyncExternalStore keeps the
// server render stable (empty selection) and hydrates the saved selection on
// the client without an effect-driven setState cascade.
const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedIds: string[] = EMPTY_IDS;

function parseIds(raw: string | null): string[] {
  if (!raw) return EMPTY_IDS;
  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) return EMPTY_IDS;
    const ids = value.filter((item): item is string => typeof item === 'string').slice(0, MAX_MODELS);
    return ids.length ? ids : EMPTY_IDS;
  } catch {
    return EMPTY_IDS;
  }
}

function getSnapshot(): string[] {
  const raw = typeof window === 'undefined' ? null : window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedIds = parseIds(raw);
  }
  return cachedIds;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function writeIds(ids: string[]) {
  cachedIds = ids.length ? ids : EMPTY_IDS;
  cachedRaw = JSON.stringify(cachedIds);
  try {
    window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  } catch {
    // private browsing / storage disabled — keep in-memory selection
  }
  listeners.forEach((listener) => listener());
}

/** Replace the whole selection (used when a shared compare URL is opened). */
export function setCompareIds(ids: string[]) {
  writeIds(ids.slice(0, MAX_MODELS));
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const ids = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_IDS);

  const setIds = useCallback((next: string[]) => writeIds(next.slice(0, MAX_MODELS)), []);

  const toggle = useCallback((slug: string) => {
    const current = getSnapshot();
    if (current.includes(slug)) writeIds(current.filter((id) => id !== slug));
    else if (current.length < MAX_MODELS) writeIds([...current, slug]);
  }, []);

  const remove = useCallback((slug: string) => {
    writeIds(getSnapshot().filter((id) => id !== slug));
  }, []);

  const clear = useCallback(() => writeIds(EMPTY_IDS), []);
  const isSelected = useCallback((slug: string) => ids.includes(slug), [ids]);

  return (
    <CompareContext.Provider value={{ ids, setIds, toggle, remove, clear, isSelected }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) throw new Error('useCompare must be used inside CompareProvider');
  return context;
}

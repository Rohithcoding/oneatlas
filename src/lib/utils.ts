import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ModelTypeKey, BenchmarkCategoryKey, Capabilities } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number | null, free?: boolean): string {
  if (free || value === 0) return 'Free';
  if (value === null) return '—';
  if (value < 0.01) return `$${value.toFixed(4)}`;
  if (value < 1) return `$${Number(value.toFixed(3))}`;
  return `$${Number(value.toFixed(2))}`;
}

export function formatPair(input: number | null, output: number | null, free?: boolean): string {
  if (free) return 'Free';
  if (input === null && output === null) return '—';
  return `${formatPrice(input)} / ${formatPrice(output)}`;
}

export function formatContext(tokens: number | null): string {
  if (!tokens) return '—';
  if (tokens >= 1_000_000) return `${Number((tokens / 1_000_000).toFixed(2))}M`;
  if (tokens >= 1_000) return `${Math.round(tokens / 1_000)}K`;
  return String(tokens);
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatScore(value: number, unit: string): string {
  return unit === 'Elo' ? Math.round(value).toLocaleString() : `${value.toFixed(1)}%`;
}

export const MODEL_TYPES: Array<{ key: ModelTypeKey; label: string }> = [
  { key: 'text', label: 'Text' },
  { key: 'image', label: 'Image' },
  { key: 'video', label: 'Video' },
  { key: 'embedding', label: 'Embedding' },
  { key: 'speech', label: 'Speech' },
  { key: 'transcription', label: 'Transcription' },
  { key: 'reranking', label: 'Reranking' },
  { key: 'realtime', label: 'Realtime' },
];

export const BENCHMARK_CATEGORIES: Array<{ key: BenchmarkCategoryKey; label: string }> = [
  { key: 'coding', label: 'Coding' },
  { key: 'reasoning', label: 'Reasoning' },
  { key: 'math', label: 'Math' },
  { key: 'science', label: 'Science' },
  { key: 'language', label: 'Language' },
  { key: 'vision', label: 'Vision' },
  { key: 'agentic', label: 'Agentic' },
];

export const CAPABILITY_LABELS: Array<{ key: keyof Capabilities; label: string; short: string }> = [
  { key: 'reasoning', label: 'Reasoning', short: 'Reasoning' },
  { key: 'toolCalling', label: 'Tool calling', short: 'Tools' },
  { key: 'structuredOutput', label: 'Structured output', short: 'JSON' },
  { key: 'vision', label: 'Vision input', short: 'Vision' },
  { key: 'openWeights', label: 'Open weights', short: 'Weights' },
];

export function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

/** Generate a stable avatar colour from a slug. */
export function colorFromSlug(slug: string) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash << 5) - hash + slug.charCodeAt(i);
  const hues = [220, 250, 275, 200, 165, 25, 345, 95];
  return `hsl(${hues[Math.abs(hash) % hues.length]} 70% 48%)`;
}

export function initials(name: string) {
  return name
    .split(/[\s-]+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function modelHref(slug: string) {
  return `/models/${slug}`;
}

export function labHref(slug: string) {
  return `/labs/${slug}`;
}

export function providerHref(slug: string) {
  return `/providers/${slug}`;
}

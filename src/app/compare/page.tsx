import type { Metadata } from 'next';
import { CompareView } from '@/components/compare/compare-view';
import { getCompareModels } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Compare',
  description: 'Compare AI models side by side on pricing, context, capabilities and benchmarks.',
};

export default async function ComparePage({ searchParams }: PageProps<'/compare'>) {
  const params = await searchParams;
  const raw = params.models;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const ids = (value ?? '').split(',').map((item) => item.trim()).filter(Boolean).slice(0, 5);
  const models = ids.length ? await getCompareModels(ids) : [];

  return <CompareView initialIds={ids} initialModels={models} />;
}

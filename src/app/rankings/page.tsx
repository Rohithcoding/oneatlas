import type { Metadata } from 'next';
import { RankingsView } from '@/components/rankings/rankings-view';
import { getBenchmarks, getRankings } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Rankings',
  description: 'Model leaderboards by overall intelligence, task category and individual benchmark.',
};

export default async function RankingsPage({ searchParams }: PageProps<'/rankings'>) {
  const params = await searchParams;
  const value = (key: string) => {
    const raw = params[key];
    return Array.isArray(raw) ? raw[0] ?? '' : raw ?? '';
  };
  const benchmarks = await getBenchmarks();
  const requestedBenchmark = value('benchmark');
  const requestedCategory = value('category');
  const benchmark = benchmarks.some((item) => item.slug === requestedBenchmark) ? requestedBenchmark : '';
  const category = benchmark ? '' : requestedCategory;
  const initialData = await getRankings({ benchmark, category, limit: 25 });

  return (
    <RankingsView
      benchmarks={benchmarks}
      initialBenchmark={benchmark}
      initialCategory={category}
      initialData={initialData}
    />
  );
}

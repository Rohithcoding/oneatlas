import type { Metadata } from 'next';
import { DirectoryView } from '@/components/directory/directory-view';
import { getLabs } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'AI Labs',
  description: 'Browse the AI research labs and companies behind the models.',
};

export default async function LabsPage({ searchParams }: PageProps<'/labs'>) {
  const params = await searchParams;
  const raw = params.q;
  const q = Array.isArray(raw) ? raw[0] ?? '' : raw ?? '';
  const items = await getLabs(q);

  return (
    <DirectoryView
      kind="labs"
      initialItems={items}
      initialQ={q}
      title="AI labs & companies"
      description="Explore the organizations training frontier models, from established research labs to fast-moving startups."
    />
  );
}

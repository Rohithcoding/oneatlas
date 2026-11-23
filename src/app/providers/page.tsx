import type { Metadata } from 'next';
import { DirectoryView } from '@/components/directory/directory-view';
import { getProviders } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Providers',
  description: 'Browse inference providers, cloud platforms and model routers.',
};

export default async function ProvidersPage({ searchParams }: PageProps<'/providers'>) {
  const params = await searchParams;
  const raw = params.q;
  const q = Array.isArray(raw) ? raw[0] ?? '' : raw ?? '';
  const items = await getProviders(q);

  return (
    <DirectoryView
      kind="providers"
      initialItems={items}
      initialQ={q}
      title="Model providers"
      description="Discover the inference APIs, cloud platforms and routers that serve models in production."
    />
  );
}

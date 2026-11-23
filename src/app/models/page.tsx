import type { Metadata } from 'next';
import { ModelsExplorer } from '@/components/models/models-explorer';
import { getModels } from '@/lib/queries';
import { parseModelQuery } from '@/lib/validation';

export const metadata: Metadata = {
  title: 'Models',
  description: 'Search and filter every AI model by lab, provider, pricing, context window and capability.',
};

export default async function ModelsPage({ searchParams }: PageProps<'/models'>) {
  const query = parseModelQuery(await searchParams);
  const initialData = await getModels(query);

  return <ModelsExplorer initialQuery={query} initialData={initialData} />;
}

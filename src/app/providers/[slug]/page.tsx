import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Globe2, Layers3, Server } from 'lucide-react';
import { getProviderBySlug } from '@/lib/queries';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ModelListCompact } from '@/components/models/model-list-compact';

type Props = PageProps<'/providers/[slug]'>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const provider = await getProviderBySlug(slug);
  return { title: provider?.name ?? 'Provider not found', description: provider ? `${provider.modelCount} models available on ${provider.name}.` : undefined };
}

export default async function ProviderDetailPage({ params }: Props) {
  const { slug } = await params;
  const provider = await getProviderBySlug(slug);
  if (!provider) notFound();

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/providers" className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600"><ArrowLeft className="size-3" /> All providers</Link>

      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
        <Avatar name={provider.name} color={provider.color} size="lg" className="size-16 rounded-2xl text-lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{provider.name}</h1>
            {provider.website && (
              <a href={provider.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline">
                Website <ArrowUpRight className="size-3" />
              </a>
            )}
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {provider.category} serving models through a unified inference endpoint. Explore the models currently available on this provider.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="indigo"><Server className="size-3" /> {provider.category}</Badge>
            {provider.region && <Badge tone="neutral"><Globe2 className="size-3" /> {provider.region}</Badge>}
            <Badge tone="neutral"><Layers3 className="size-3" /> {provider.modelCount} models</Badge>
          </div>
        </div>
      </div>

      <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Models available on {provider.name}</h2>
          <p className="mt-1 text-xs text-slate-500">Provider pricing may differ from the model baseline</p>
        </div>
        <ModelListCompact models={provider.models} />
      </section>
    </div>
  );
}

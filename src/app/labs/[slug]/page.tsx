import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Building2, CalendarDays, Globe2, Layers3 } from 'lucide-react';
import { getLabBySlug } from '@/lib/queries';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ModelListCompact } from '@/components/models/model-list-compact';

type Props = PageProps<'/labs/[slug]'>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lab = await getLabBySlug(slug);
  return { title: lab?.name ?? 'Lab not found', description: lab?.description };
}

export default async function LabDetailPage({ params }: Props) {
  const { slug } = await params;
  const lab = await getLabBySlug(slug);
  if (!lab) notFound();

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/labs" className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600"><ArrowLeft className="size-3" /> All labs</Link>

      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
        <Avatar name={lab.name} color={lab.color} size="lg" className="size-16 rounded-2xl text-lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{lab.name}</h1>
            {lab.website && (
              <a href={lab.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline">
                Website <ArrowUpRight className="size-3" />
              </a>
            )}
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">{lab.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {lab.country && <Badge tone="neutral"><Globe2 className="size-3" /> {lab.country}</Badge>}
            {lab.founded && <Badge tone="neutral"><CalendarDays className="size-3" /> Founded {lab.founded}</Badge>}
            <Badge tone="indigo"><Layers3 className="size-3" /> {lab.modelCount} models</Badge>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Models in catalogue', value: lab.modelCount, Icon: Layers3 },
          { label: 'Highest index', value: lab.topModel?.intelligence?.toFixed(1) ?? '—', Icon: Building2 },
          { label: 'Countries', value: lab.country ?? 'Global', Icon: Globe2 },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between text-xs text-slate-500"><span>{stat.label}</span><stat.Icon className="size-4 text-indigo-500" /></div>
            <p className="mt-2 font-mono text-xl font-semibold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Models by {lab.name}</h2>
          <p className="mt-1 text-xs text-slate-500">Ordered by intelligence index</p>
        </div>
        <ModelListCompact models={lab.models} showLab={false} />
      </section>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Boxes, Brain, Braces, CheckCircle2, Clock, Eye, Gauge, Wrench, XCircle } from 'lucide-react';
import { getModelBySlug } from '@/lib/queries';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CompareButton } from '@/components/models/compare-button';
import { cn, formatContext, formatDate, formatPrice, formatScore, modelHref } from '@/lib/utils';

type Props = PageProps<'/models/[...slug]'>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const model = await getModelBySlug(slug.join('/'));
  if (!model) return { title: 'Model not found' };
  return {
    title: model.name,
    description: model.description.slice(0, 155),
  };
}

export default async function ModelDetailPage({ params }: Props) {
  const { slug } = await params;
  const model = await getModelBySlug(slug.join('/'));
  if (!model) notFound();

  const capabilities = [
    { label: 'Reasoning', active: model.capabilities.reasoning, Icon: Brain },
    { label: 'Tool calling', active: model.capabilities.toolCalling, Icon: Wrench },
    { label: 'Structured output', active: model.capabilities.structuredOutput, Icon: Braces },
    { label: 'Vision input', active: model.capabilities.vision, Icon: Eye },
    { label: 'Open weights', active: model.capabilities.openWeights, Icon: Boxes },
  ];

  const stats = [
    { label: 'Context window', value: formatContext(model.contextWindow), hint: 'tokens' },
    { label: 'Max output', value: formatContext(model.maxOutput), hint: 'tokens' },
    { label: 'Input price', value: formatPrice(model.inputPrice, model.free), hint: 'per 1M tokens' },
    { label: 'Output price', value: formatPrice(model.outputPrice, model.free), hint: 'per 1M tokens' },
    { label: 'Intelligence index', value: model.intelligence?.toFixed(1) ?? '—', hint: 'out of 100' },
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-2 text-xs text-slate-500">
        <Link href="/models" className="flex items-center gap-1 hover:text-indigo-600"><ArrowLeft className="size-3" /> Models</Link>
        <span className="text-slate-300">/</span>
        <Link href={`/labs/${model.lab.slug}`} className="hover:text-indigo-600">{model.lab.name}</Link>
        <span className="text-slate-300">/</span>
        <span className="truncate font-medium text-slate-700">{model.name}</span>
      </div>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <Avatar name={model.lab.name} color={model.lab.color} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{model.name}</h1>
            {model.free && <Badge tone="emerald">Free</Badge>}
            {model.deprecated && <Badge tone="rose">Deprecated</Badge>}
          </div>
          <p className="mt-1.5 text-sm text-slate-500">
            by <Link href={`/labs/${model.lab.slug}`} className="font-medium text-indigo-600 hover:underline">{model.lab.name}</Link>
            {' · '}<span className="capitalize">{model.type}</span> model
            {model.parameters && <> · {model.parameters} parameters</>}
            {' · '}released {formatDate(model.releasedAt)}
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{model.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <CompareButton slug={model.slug} />
            {model.website && (
              <a href={model.website} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Lab website <ArrowUpRight className="size-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{stat.label}</p>
            <p className="mt-2 font-mono text-xl font-semibold tabular-nums text-slate-900">{stat.value}</p>
            <p className="mt-1 text-[11px] text-slate-400">{stat.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900">Capabilities</h2>
            </div>
            <div className="grid gap-px bg-slate-100 sm:grid-cols-2 lg:grid-cols-3">
              {capabilities.map(({ label, active, Icon }) => (
                <div key={label} className="flex items-center gap-3 bg-white px-5 py-4">
                  <span className={cn('flex size-8 items-center justify-center rounded-lg', active ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-300')}>
                    <Icon className="size-4" />
                  </span>
                  <span className="flex-1 text-sm text-slate-700">{label}</span>
                  {active ? <CheckCircle2 className="size-4 text-emerald-500" /> : <XCircle className="size-4 text-slate-300" />}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900">Benchmark performance</h2>
              <Link href="/rankings" className="text-xs font-medium text-indigo-600 hover:underline">All rankings</Link>
            </div>
            {model.scores.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-slate-500">No benchmark results recorded for this model yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {model.scores.slice(0, 8).map((score) => {
                  const pct = Math.min(100, (score.score / score.benchmark.maxScore) * 100);
                  return (
                    <div key={score.benchmark.slug} className="flex items-center gap-4 px-5 py-3.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <Link href={`/rankings?benchmark=${score.benchmark.slug}`} className="truncate text-sm font-medium text-slate-800 hover:text-indigo-600">
                            {score.benchmark.name}
                          </Link>
                          <span className="font-mono text-sm font-semibold tabular-nums text-slate-900">
                            {formatScore(score.score, score.benchmark.unit)}
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      {score.rank && <Badge tone="neutral">#{score.rank}</Badge>}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900">Available providers</h2>
              <Badge tone="neutral">{model.listings.length} listings</Badge>
            </div>
            <div className="scrollbar-thin overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-50/70 text-[11px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-2.5 font-semibold">Provider</th>
                    <th className="px-3 py-2.5 font-semibold">Input / 1M</th>
                    <th className="px-3 py-2.5 font-semibold">Output / 1M</th>
                    <th className="px-3 py-2.5 font-semibold">Context</th>
                    <th className="px-3 py-2.5 font-semibold">Throughput</th>
                    <th className="px-5 py-2.5 text-right font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {model.listings.map((listing) => (
                    <tr key={listing.provider.slug} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3">
                        <Link href={`/providers/${listing.provider.slug}`} className="flex items-center gap-2.5">
                          <Avatar name={listing.provider.name} color={listing.provider.color} size="sm" />
                          <span className="font-medium text-slate-800 hover:text-indigo-600">{listing.provider.name}</span>
                        </Link>
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-slate-700">{formatPrice(listing.inputPrice, model.free)}</td>
                      <td className="px-3 py-3 font-mono text-xs text-slate-700">{formatPrice(listing.outputPrice, model.free)}</td>
                      <td className="px-3 py-3 font-mono text-xs text-slate-500">{formatContext(listing.contextWindow)}</td>
                      <td className="px-3 py-3 text-xs text-slate-500">{listing.throughput ? `${listing.throughput} tok/s` : '—'}</td>
                      <td className="px-5 py-3 text-right">
                        <span className={cn('inline-flex items-center gap-1.5 text-xs', listing.available ? 'text-emerald-600' : 'text-slate-400')}>
                          <span className={cn('size-1.5 rounded-full', listing.available ? 'bg-emerald-500' : 'bg-slate-300')} />
                          {listing.available ? 'Available' : 'Paused'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">Quick facts</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ['Model type', <span key="type" className="capitalize">{model.type}</span>],
                ['Lab', <Link key="lab" href={`/labs/${model.lab.slug}`} className="text-indigo-600 hover:underline">{model.lab.name}</Link>],
                ['Parameters', model.parameters ?? 'Not disclosed'],
                ['License', model.license ?? 'Proprietary'],
                ['Cache price', formatPrice(model.cachePrice, model.free)],
                ['Released', formatDate(model.releasedAt)],
                ['Last updated', formatDate(model.updatedAt)],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex items-start justify-between gap-4">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="text-right font-medium text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Gauge className="size-4 text-indigo-500" /> Cost snapshot</h2>
            <div className="mt-4 rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Blended price per 1M tokens</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-slate-900">
                {formatPrice(
                  model.inputPrice !== null && model.outputPrice !== null
                    ? (model.inputPrice * 3 + model.outputPrice) / 4
                    : model.inputPrice ?? model.outputPrice,
                  model.free
                )}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">Assumes a 3:1 input-to-output token ratio</p>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500"><Clock className="size-3.5" /> Updated {formatDate(model.updatedAt)}</p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">Related models</h2>
            <div className="mt-3 space-y-1">
              {model.related.map((related) => (
                <Link key={related.id} href={modelHref(related.slug)} className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition hover:bg-slate-50">
                  <Avatar name={related.lab.name} color={related.lab.color} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-800">{related.name}</span>
                    <span className="block text-xs text-slate-400">{related.lab.name}</span>
                  </span>
                  <span className="font-mono text-xs text-slate-400">{formatContext(related.contextWindow)}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

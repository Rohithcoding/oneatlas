/**
 * Server-side data access layer.
 *
 * Both React Server Components (initial page data) and API Route Handlers
 * (interactive client fetching) call these functions, so there is exactly one
 * implementation of every filtering / ranking rule.
 */
import { Prisma, ModelType, BenchmarkCategory } from '@prisma/client';
import { prisma } from './prisma';
import type {
  ModelListItem,
  ModelDetail,
  ModelsResponse,
  Facet,
  RankingsResponse,
  RankingRow,
  BenchmarkSummary,
  LabDetail,
  ProviderDetail,
  SiteStats,
  SearchResult,
  ModelTypeKey,
  BenchmarkCategoryKey,
  Capabilities,
} from './types';
import type { ModelQuery } from './validation';

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

const modelInclude = {
  lab: { select: { slug: true, name: true, color: true, country: true, website: true } },
  listings: {
    where: { available: true },
    select: {
      inputPrice: true,
      outputPrice: true,
      provider: { select: { slug: true, name: true, color: true, category: true } },
    },
    orderBy: { inputPrice: 'asc' },
  },
  scores: { select: { score: true }, orderBy: { score: 'desc' }, take: 1 },
  _count: { select: { listings: true } },
} satisfies Prisma.ModelInclude;

type ModelRow = Prisma.ModelGetPayload<{ include: typeof modelInclude }>;

function toModelTypeKey(type: ModelType): ModelTypeKey {
  return type.toLowerCase() as ModelTypeKey;
}

function toCategoryKey(category: BenchmarkCategory): BenchmarkCategoryKey {
  return category.toLowerCase() as BenchmarkCategoryKey;
}

function mapModel(row: ModelRow): ModelListItem {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    lab: {
      slug: row.lab.slug,
      name: row.lab.name,
      color: row.lab.color,
      country: row.lab.country,
    },
    type: toModelTypeKey(row.type),
    description: row.description,
    contextWindow: row.contextWindow,
    maxOutput: row.maxOutput,
    inputPrice: row.inputPrice,
    outputPrice: row.outputPrice,
    cachePrice: row.cachePrice,
    intelligence: row.intelligence,
    parameters: row.parameters,
    license: row.license,
    capabilities: {
      reasoning: row.reasoning,
      toolCalling: row.toolCalling,
      structuredOutput: row.structuredOutput,
      vision: row.vision,
      openWeights: row.openWeights,
    },
    free: row.free,
    deprecated: row.deprecated,
    releasedAt: row.releasedAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    providerCount: row._count.listings,
    topProviders: row.listings.slice(0, 4).map((listing) => ({
      slug: listing.provider.slug,
      name: listing.provider.name,
      color: listing.provider.color,
      category: listing.provider.category,
    })),
    bestScore: row.scores[0]?.score ?? null,
  };
}

// ---------------------------------------------------------------------------
// Model catalogue
// ---------------------------------------------------------------------------

const CAPABILITY_FIELDS: Record<string, keyof Capabilities> = {
  reasoning: 'reasoning',
  tools: 'toolCalling',
  toolCalling: 'toolCalling',
  json: 'structuredOutput',
  structuredOutput: 'structuredOutput',
  vision: 'vision',
  openWeights: 'openWeights',
  weights: 'openWeights',
};

function buildModelWhere(
  query: ModelQuery,
  skip: Partial<Record<'lab' | 'provider' | 'type', boolean>> = {}
): Prisma.ModelWhereInput {
  const where: Prisma.ModelWhereInput = {};

  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: 'insensitive' } },
      { description: { contains: query.q, mode: 'insensitive' } },
      { slug: { contains: query.q, mode: 'insensitive' } },
      { lab: { name: { contains: query.q, mode: 'insensitive' } } },
    ];
  }
  if (query.lab && !skip.lab) where.lab = { slug: query.lab };
  if (query.provider && !skip.provider) {
    where.listings = { some: { provider: { slug: query.provider }, available: true } };
  }
  if (query.type && !skip.type) where.type = query.type.toUpperCase() as ModelType;
  if (query.minContext > 0) where.contextWindow = { gte: query.minContext };
  if (query.maxPrice !== undefined) where.inputPrice = { lte: query.maxPrice };
  if (query.free) where.free = true;
  if (query.openWeights) where.openWeights = true;
  if (query.hideDeprecated) where.deprecated = false;

  const capabilityFilters = query.capabilities
    .map((cap) => CAPABILITY_FIELDS[cap])
    .filter((field): field is keyof Capabilities => Boolean(field))
    .map((field) => ({ [field]: true }) as Prisma.ModelWhereInput);
  if (capabilityFilters.length) where.AND = capabilityFilters;

  return where;
}

const ORDER_BY: Record<ModelQuery['sort'], Prisma.ModelOrderByWithRelationInput[]> = {
  released: [{ releasedAt: 'desc' }],
  intelligence: [{ intelligence: { sort: 'desc', nulls: 'last' } }, { releasedAt: 'desc' }],
  'price-asc': [{ inputPrice: { sort: 'asc', nulls: 'last' } }, { releasedAt: 'desc' }],
  'price-desc': [{ inputPrice: { sort: 'desc', nulls: 'last' } }],
  context: [{ contextWindow: { sort: 'desc', nulls: 'last' } }],
  name: [{ name: 'asc' }],
};

async function buildFacets(query: ModelQuery): Promise<ModelsResponse['meta']['facets']> {
  const [labs, types, providers] = await Promise.all([
    prisma.model.groupBy({
      by: ['labId'],
      where: buildModelWhere(query, { lab: true }),
      _count: { _all: true },
    }),
    prisma.model.groupBy({
      by: ['type'],
      where: buildModelWhere(query, { type: true }),
      _count: { _all: true },
    }),
    prisma.modelProvider.groupBy({
      by: ['providerId'],
      where: { available: true, model: buildModelWhere(query, { provider: true }) },
      _count: { modelId: true },
    }),
  ]);

  const [labRows, providerRows] = await Promise.all([
    prisma.lab.findMany({ select: { id: true, slug: true, name: true, color: true } }),
    prisma.provider.findMany({ select: { id: true, slug: true, name: true, color: true } }),
  ]);

  const labMap = new Map(labRows.map((l) => [l.id, l]));
  const providerMap = new Map(providerRows.map((p) => [p.id, p]));

  const labFacets: Facet[] = labs
    .flatMap((item) => {
      const lab = labMap.get(item.labId);
      if (!lab) return [];
      return [{ value: lab.slug, label: lab.name, count: item._count._all, color: lab.color }];
    })
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const typeFacets: Facet[] = types
    .map((item) => ({
      value: toModelTypeKey(item.type),
      label: toModelTypeKey(item.type).replace(/^\w/, (c) => c.toUpperCase()),
      count: item._count._all,
    }))
    .sort((a, b) => b.count - a.count);

  const providerFacets: Facet[] = providers
    .flatMap((item) => {
      const provider = providerMap.get(item.providerId);
      if (!provider) return [];
      return [{ value: provider.slug, label: provider.name, count: item._count.modelId, color: provider.color }];
    })
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  return { labs: labFacets, providers: providerFacets, types: typeFacets };
}

export async function getModels(query: ModelQuery): Promise<ModelsResponse> {
  const where = buildModelWhere(query);
  const [rows, total, facets] = await Promise.all([
    prisma.model.findMany({
      where,
      include: modelInclude,
      orderBy: ORDER_BY[query.sort],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.model.count({ where }),
    buildFacets(query),
  ]);

  return {
    data: rows.map(mapModel),
    meta: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
      facets,
    },
  };
}

export async function getModelBySlug(slug: string): Promise<ModelDetail | null> {
  const row = await prisma.model.findUnique({
    where: { slug },
    include: {
      ...modelInclude,
      listings: {
        select: {
          inputPrice: true,
          outputPrice: true,
          cachePrice: true,
          contextWindow: true,
          throughput: true,
          latencyMs: true,
          available: true,
          provider: { select: { slug: true, name: true, color: true, category: true, website: true } },
        },
        orderBy: [{ available: 'desc' }, { inputPrice: 'asc' }],
      },
      scores: {
        select: {
          score: true,
          rank: true,
          benchmark: {
            select: { slug: true, name: true, category: true, maxScore: true, unit: true },
          },
        },
        orderBy: { score: 'desc' },
      },
    },
  });
  if (!row) return null;

  const relatedRows = await prisma.model.findMany({
    where: {
      id: { not: row.id },
      deprecated: false,
      OR: [{ labId: row.labId }, { type: row.type }],
    },
    include: modelInclude,
    orderBy: { intelligence: { sort: 'desc', nulls: 'last' } },
    take: 4,
  });

  const base = mapModel(row as ModelRow);
  return {
    ...base,
    website: row.lab.website,
    listings: row.listings.map((listing) => ({
      provider: {
        slug: listing.provider.slug,
        name: listing.provider.name,
        color: listing.provider.color,
        category: listing.provider.category,
      },
      inputPrice: listing.inputPrice,
      outputPrice: listing.outputPrice,
      cachePrice: listing.cachePrice,
      contextWindow: listing.contextWindow,
      throughput: listing.throughput,
      latencyMs: listing.latencyMs,
      available: listing.available,
    })),
    scores: row.scores.map((score) => ({
      benchmark: {
        slug: score.benchmark.slug,
        name: score.benchmark.name,
        category: toCategoryKey(score.benchmark.category),
        maxScore: score.benchmark.maxScore,
        unit: score.benchmark.unit,
      },
      score: score.score,
      rank: score.rank,
    })),
    related: relatedRows.map(mapModel),
  };
}

export async function getCompareModels(slugs: string[]): Promise<ModelDetail[]> {
  const results = await Promise.all(slugs.slice(0, 5).map((slug) => getModelBySlug(slug)));
  return results.filter((model): model is ModelDetail => model !== null);
}

// ---------------------------------------------------------------------------
// Labs & providers
// ---------------------------------------------------------------------------

export async function getLabs(search = '') {
  const rows = await prisma.lab.findMany({
    where: search
      ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }] }
      : undefined,
    include: { _count: { select: { models: true } } },
    orderBy: [{ models: { _count: 'desc' } }, { name: 'asc' }],
  });
  return rows.map((row) => ({
    slug: row.slug,
    name: row.name,
    color: row.color,
    country: row.country,
    founded: row.founded,
    description: row.description,
    website: row.website,
    modelCount: row._count.models,
  }));
}

export async function getLabBySlug(slug: string): Promise<LabDetail | null> {
  const lab = await prisma.lab.findUnique({
    where: { slug },
    include: {
      models: {
        include: modelInclude,
        orderBy: { intelligence: { sort: 'desc', nulls: 'last' } },
        take: 24,
      },
      _count: { select: { models: true } },
    },
  });
  if (!lab) return null;

  const models = lab.models.map(mapModel);
  return {
    slug: lab.slug,
    name: lab.name,
    color: lab.color,
    country: lab.country,
    description: lab.description,
    website: lab.website,
    founded: lab.founded,
    modelCount: lab._count.models,
    models,
    topModel: models[0] ?? null,
  };
}

export async function getProviders(search = '') {
  const [rows, counts] = await Promise.all([
    prisma.provider.findMany({
      where: search
        ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { category: { contains: search, mode: 'insensitive' } }] }
        : undefined,
      orderBy: { name: 'asc' },
    }),
    prisma.modelProvider.groupBy({
      by: ['providerId'],
      where: { available: true },
      _count: { modelId: true },
    }),
  ]);
  const countMap = new Map(counts.map((item) => [item.providerId, item._count.modelId]));
  return rows.map((row) => ({
    slug: row.slug,
    name: row.name,
    color: row.color,
    category: row.category,
    region: row.region,
    website: row.website,
    modelCount: countMap.get(row.id) ?? 0,
  }));
}

export async function getProviderBySlug(slug: string): Promise<ProviderDetail | null> {
  const provider = await prisma.provider.findUnique({ where: { slug } });
  if (!provider) return null;

  const listings = await prisma.modelProvider.findMany({
    where: { providerId: provider.id, available: true },
    include: { model: { include: modelInclude } },
  });
  const models = listings
    .map((listing) => mapModel(listing.model as ModelRow))
    .sort((a, b) => (b.intelligence ?? 0) - (a.intelligence ?? 0));

  return {
    slug: provider.slug,
    name: provider.name,
    color: provider.color,
    category: provider.category,
    region: provider.region,
    website: provider.website,
    modelCount: models.length,
    models,
  };
}

// ---------------------------------------------------------------------------
// Benchmarks & rankings
// ---------------------------------------------------------------------------

export async function getBenchmarks(): Promise<BenchmarkSummary[]> {
  const rows = await prisma.benchmark.findMany({
    include: {
      scores: {
        orderBy: { score: 'desc' },
        take: 1,
        include: { model: { select: { slug: true, name: true } } },
      },
      _count: { select: { scores: true } },
    },
    orderBy: { name: 'asc' },
  });

  return rows.map((row) => ({
    slug: row.slug,
    name: row.name,
    category: toCategoryKey(row.category),
    description: row.description,
    unit: row.unit,
    maxScore: row.maxScore,
    modelCount: row._count.scores,
    topModel: row.scores[0]
      ? {
          slug: row.scores[0].model.slug,
          name: row.scores[0].model.name,
          score: row.scores[0].score,
        }
      : null,
  }));
}

export async function getBenchmarkBySlug(slug: string) {
  const benchmark = await prisma.benchmark.findUnique({ where: { slug } });
  if (!benchmark) return null;
  const rows = await getRankings({ benchmark: slug, category: '', limit: 100 });
  return { ...benchmark, rows: rows.rows };
}

function mapRankingRows(entries: Array<{ model: ModelListItem; score: number }>): RankingRow[] {
  return entries
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({ rank: index + 1, ...entry, previousRank: null }));
}

export async function getRankings(params: {
  benchmark: string;
  category: string;
  limit: number;
}): Promise<RankingsResponse> {
  const limit = Math.min(params.limit, 100);

  if (params.benchmark) {
    const benchmark = await prisma.benchmark.findUnique({ where: { slug: params.benchmark } });
    if (!benchmark) throw new Error('BENCHMARK_NOT_FOUND');
    const scores = await prisma.benchmarkScore.findMany({
      where: { benchmarkId: benchmark.id },
      include: { model: { include: modelInclude } },
      orderBy: { score: 'desc' },
      take: limit,
    });
    return {
      benchmark: {
        slug: benchmark.slug,
        name: benchmark.name,
        category: toCategoryKey(benchmark.category),
        description: benchmark.description,
        unit: benchmark.unit,
        maxScore: benchmark.maxScore,
      },
      rows: mapRankingRows(scores.map((score) => ({ model: mapModel(score.model as ModelRow), score: score.score }))),
    };
  }

  if (params.category) {
    const category = params.category.toUpperCase() as BenchmarkCategory;
    if (!Object.values(BenchmarkCategory).includes(category)) throw new Error('CATEGORY_NOT_FOUND');
    const grouped = await prisma.benchmarkScore.groupBy({
      by: ['modelId'],
      where: { benchmark: { category } },
      _avg: { score: true },
      orderBy: { _avg: { score: 'desc' } },
      take: limit,
    });
    const models = await prisma.model.findMany({
      where: { id: { in: grouped.map((item) => item.modelId) } },
      include: modelInclude,
    });
    const modelMap = new Map(models.map((model) => [model.id, mapModel(model as ModelRow)]));
    const rows = grouped
      .map((item) => ({
        model: modelMap.get(item.modelId),
        score: item._avg.score ?? 0,
      }))
      .filter((item): item is { model: ModelListItem; score: number } => Boolean(item.model));
    return {
      benchmark: {
        slug: `category-${params.category}`,
        name: `${params.category.charAt(0).toUpperCase() + params.category.slice(1)} index`,
        category: params.category as BenchmarkCategoryKey,
        description: `Average score across all ${params.category} benchmarks in the OneAtlas catalogue.`,
        unit: '%',
        maxScore: 100,
      },
      rows: mapRankingRows(rows),
    };
  }

  const models = await prisma.model.findMany({
    where: { deprecated: false, intelligence: { not: null } },
    include: modelInclude,
    orderBy: { intelligence: { sort: 'desc', nulls: 'last' } },
    take: limit,
  });
  return {
    benchmark: {
      slug: 'overall',
      name: 'OneAtlas Intelligence Index',
      category: 'overall',
      description:
        'Composite index across reasoning, coding, knowledge and multimodal evaluations. Higher is better.',
      unit: '/100',
      maxScore: 100,
    },
    rows: mapRankingRows(
      models.map((model) => ({ model: mapModel(model as ModelRow), score: model.intelligence ?? 0 }))
    ),
  };
}

// ---------------------------------------------------------------------------
// Stats & global search
// ---------------------------------------------------------------------------

export async function getStats(): Promise<SiteStats> {
  const [modelCount, labCount, providerCount, listingCount, benchmarkCount, recent] = await Promise.all([
    prisma.model.count({ where: { deprecated: false } }),
    prisma.lab.count(),
    prisma.provider.count(),
    prisma.modelProvider.count({ where: { available: true } }),
    prisma.benchmark.count(),
    prisma.model.findMany({
      where: { releasedAt: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } },
      select: { releasedAt: true },
    }),
  ]);

  const allCapabilities = await prisma.model.findMany({
    where: { deprecated: false },
    select: {
      reasoning: true,
      toolCalling: true,
      structuredOutput: true,
      vision: true,
      openWeights: true,
    },
  });

  const capabilityLabels: Array<[keyof Capabilities, string]> = [
    ['reasoning', 'Reasoning'],
    ['toolCalling', 'Tool calling'],
    ['vision', 'Vision input'],
    ['openWeights', 'Open weights'],
  ];

  const coverage = capabilityLabels.map(([key, label]) => ({
    key,
    label,
    percentage: allCapabilities.length
      ? Math.round((allCapabilities.filter((model) => model[key]).length / allCapabilities.length) * 100)
      : 0,
  }));

  const monthKeys: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    monthKeys.push(date.toISOString().slice(0, 7));
  }
  const monthCounts = new Map(monthKeys.map((key) => [key, 0]));
  for (const row of recent) {
    const key = row.releasedAt.toISOString().slice(0, 7);
    if (monthCounts.has(key)) monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1);
  }

  return {
    models: modelCount,
    labs: labCount,
    providers: providerCount,
    listings: listingCount,
    benchmarks: benchmarkCount,
    releasesLastYear: recent.length,
    capabilityCoverage: coverage,
    releasesByMonth: monthKeys.map((month) => ({
      month: new Date(`${month}-01T00:00:00Z`).toLocaleDateString('en-US', {
        month: 'short',
        timeZone: 'UTC',
      }),
      count: monthCounts.get(month) ?? 0,
    })),
  };
}

export async function searchAll(query: string, limit: number): Promise<SearchResult> {
  const [models, labs, providers] = await Promise.all([
    prisma.model.findMany({
      where: {
        deprecated: false,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { slug: { contains: query, mode: 'insensitive' } },
          { lab: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: modelInclude,
      orderBy: { intelligence: { sort: 'desc', nulls: 'last' } },
      take: limit,
    }),
    prisma.lab.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      include: { _count: { select: { models: true } } },
      take: 3,
      orderBy: { name: 'asc' },
    }),
    prisma.provider.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      include: { _count: { select: { listings: true } } },
      take: 3,
      orderBy: { name: 'asc' },
    }),
  ]);

  return {
    models: models.map(mapModel),
    labs: labs.map((lab) => ({
      slug: lab.slug,
      name: lab.name,
      color: lab.color,
      modelCount: lab._count.models,
    })),
    providers: providers.map((provider) => ({
      slug: provider.slug,
      name: provider.name,
      color: provider.color,
      modelCount: provider._count.listings,
    })),
  };
}

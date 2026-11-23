/** Public DTOs shared by the API routes and every UI surface. */

export type ModelTypeKey =
  | 'text'
  | 'image'
  | 'video'
  | 'embedding'
  | 'speech'
  | 'transcription'
  | 'reranking'
  | 'realtime';

export type BenchmarkCategoryKey =
  | 'coding'
  | 'reasoning'
  | 'math'
  | 'science'
  | 'language'
  | 'vision'
  | 'agentic';

export interface LabSummary {
  slug: string;
  name: string;
  color: string;
  country: string | null;
}

export interface ProviderSummary {
  slug: string;
  name: string;
  color: string;
  category: string;
}

export interface Capabilities {
  reasoning: boolean;
  toolCalling: boolean;
  structuredOutput: boolean;
  vision: boolean;
  openWeights: boolean;
}

export interface ModelListItem {
  id: string;
  slug: string;
  name: string;
  lab: LabSummary;
  type: ModelTypeKey;
  description: string;
  contextWindow: number | null;
  maxOutput: number | null;
  inputPrice: number | null;
  outputPrice: number | null;
  cachePrice: number | null;
  intelligence: number | null;
  parameters: string | null;
  license: string | null;
  capabilities: Capabilities;
  free: boolean;
  deprecated: boolean;
  releasedAt: string;
  updatedAt: string;
  providerCount: number;
  topProviders: ProviderSummary[];
  bestScore: number | null;
}

export interface ModelListing {
  provider: ProviderSummary;
  inputPrice: number | null;
  outputPrice: number | null;
  cachePrice: number | null;
  contextWindow: number | null;
  throughput: number | null;
  latencyMs: number | null;
  available: boolean;
}

export interface ScoreEntry {
  benchmark: {
    slug: string;
    name: string;
    category: BenchmarkCategoryKey;
    maxScore: number;
    unit: string;
  };
  score: number;
  rank: number | null;
}

export interface ModelDetail extends ModelListItem {
  website: string | null;
  listings: ModelListing[];
  scores: ScoreEntry[];
  related: ModelListItem[];
}

export interface Facet {
  value: string;
  label: string;
  count: number;
  color?: string;
}

export interface ModelMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets: {
    labs: Facet[];
    providers: Facet[];
    types: Facet[];
  };
}

export interface ModelsResponse {
  data: ModelListItem[];
  meta: ModelMeta;
}

export interface RankingRow {
  rank: number;
  model: ModelListItem;
  score: number;
  previousRank?: number | null;
}

export interface RankingsResponse {
  benchmark: {
    slug: string;
    name: string;
    category: BenchmarkCategoryKey | 'overall';
    description: string;
    unit: string;
    maxScore: number;
  };
  rows: RankingRow[];
}

export interface BenchmarkSummary {
  slug: string;
  name: string;
  category: BenchmarkCategoryKey;
  description: string;
  unit: string;
  maxScore: number;
  modelCount: number;
  topModel: { slug: string; name: string; score: number } | null;
}

export interface LabDetail extends LabSummary {
  description: string;
  website: string | null;
  founded: number | null;
  modelCount: number;
  models: ModelListItem[];
  topModel: ModelListItem | null;
}

export interface ProviderDetail extends ProviderSummary {
  website: string | null;
  region: string | null;
  modelCount: number;
  models: ModelListItem[];
}

export interface SiteStats {
  models: number;
  labs: number;
  providers: number;
  listings: number;
  benchmarks: number;
  releasesLastYear: number;
  capabilityCoverage: Array<{ key: keyof Capabilities; label: string; percentage: number }>;
  releasesByMonth: Array<{ month: string; count: number }>;
}

export interface SearchResult {
  models: ModelListItem[];
  labs: Array<{ slug: string; name: string; color: string; modelCount: number }>;
  providers: Array<{ slug: string; name: string; color: string; modelCount: number }>;
}

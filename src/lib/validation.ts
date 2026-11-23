import { z } from 'zod';
import { MODEL_TYPES } from './utils';

const modelTypes = MODEL_TYPES.map((t) => t.key) as [string, ...string[]];

const csvToArray = (value: unknown): string[] => {
  if (typeof value !== 'string') return [];
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
};

const optionalInt = (fallback: number, min: number, max: number) =>
  z.coerce.number().int().min(min).max(max).default(fallback);

const optionalFloat = z.coerce.number().min(0).max(1_000_000).optional();

// z.coerce.boolean() treats the string "false" as truthy, so parse explicitly.
const boolParam = z.preprocess((value) => {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1') return true;
  if (value === undefined || value === '' || value === 'false' || value === '0') return false;
  return value;
}, z.boolean().default(false));

export const modelQuerySchema = z.object({
  q: z.string().trim().max(160).default(''),
  lab: z.string().max(80).default(''),
  provider: z.string().max(80).default(''),
  type: z.enum(modelTypes).or(z.literal('')).default(''),
  capabilities: z.preprocess(csvToArray, z.array(z.string()).max(5).default([])),
  minContext: optionalInt(0, 0, 100_000_000),
  maxPrice: optionalFloat,
  free: boolParam,
  openWeights: boolParam,
  hideDeprecated: z.preprocess((value) => {
    if (value === undefined || value === '') return true;
    if (typeof value === 'boolean') return value;
    if (value === 'false' || value === '0') return false;
    if (value === 'true' || value === '1') return true;
    return value;
  }, z.boolean().default(true)),
  sort: z
    .enum(['released', 'intelligence', 'price-asc', 'price-desc', 'context', 'name'])
    .default('released'),
  page: optionalInt(1, 1, 10_000),
  limit: optionalInt(24, 1, 100),
});

export type ModelQuery = z.infer<typeof modelQuerySchema>;

export const directoryQuerySchema = z.object({
  q: z.string().trim().max(160).default(''),
  page: optionalInt(1, 1, 10_000),
  limit: optionalInt(24, 1, 100),
});

export const rankingsQuerySchema = z.object({
  benchmark: z.string().max(80).default(''),
  category: z.string().max(40).default(''),
  limit: optionalInt(25, 1, 100),
});

export const compareQuerySchema = z.object({
  models: z.preprocess(csvToArray, z.array(z.string()).min(1).max(5)),
});

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(160),
  limit: optionalInt(6, 1, 20),
});

/** Parse a URLSearchParams object with the shared model schema. */
export function parseModelQuery(params: URLSearchParams | Record<string, string | string[] | undefined>) {
  const raw =
    params instanceof URLSearchParams
      ? Object.fromEntries(params.entries())
      : Object.fromEntries(
          Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value ?? ''])
        );
  return modelQuerySchema.parse(raw);
}

export { z };

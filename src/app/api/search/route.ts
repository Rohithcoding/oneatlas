import { searchAll } from '@/lib/queries';
import { searchQuerySchema } from '@/lib/validation';
import { json, withErrors } from '@/lib/api';

/** GET /api/search?q=... — unified command-palette search. */
export async function GET(request: Request) {
  return withErrors(async () => {
    const { q, limit } = searchQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return json(await searchAll(q, limit));
  });
}

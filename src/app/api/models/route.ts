import { getModels } from '@/lib/queries';
import { parseModelQuery } from '@/lib/validation';
import { json, withErrors } from '@/lib/api';

/** GET /api/models — searchable, filterable, sortable, paginated catalogue. */
export async function GET(request: Request) {
  return withErrors(async () => {
    const query = parseModelQuery(new URL(request.url).searchParams);
    return json(await getModels(query));
  });
}

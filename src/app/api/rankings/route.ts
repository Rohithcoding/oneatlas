import { getRankings } from '@/lib/queries';
import { rankingsQuerySchema } from '@/lib/validation';
import { json, withErrors } from '@/lib/api';

export async function GET(request: Request) {
  return withErrors(async () => {
    const params = rankingsQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return json(await getRankings(params));
  });
}

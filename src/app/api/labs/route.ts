import { getLabs } from '@/lib/queries';
import { directoryQuerySchema } from '@/lib/validation';
import { json, withErrors } from '@/lib/api';

export async function GET(request: Request) {
  return withErrors(async () => {
    const { q } = directoryQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return json(await getLabs(q));
  });
}

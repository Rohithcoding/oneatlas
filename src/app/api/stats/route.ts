import { getStats } from '@/lib/queries';
import { json, withErrors } from '@/lib/api';

export async function GET() {
  return withErrors(async () => json(await getStats()));
}

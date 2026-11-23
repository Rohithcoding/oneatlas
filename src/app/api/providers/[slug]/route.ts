import { getProviderBySlug } from '@/lib/queries';
import { json, withErrors } from '@/lib/api';

export async function GET(_request: Request, ctx: RouteContext<'/api/providers/[slug]'>) {
  return withErrors(async () => {
    const { slug } = await ctx.params;
    const provider = await getProviderBySlug(slug);
    if (!provider) throw new Error('PROVIDER_NOT_FOUND');
    return json(provider);
  });
}

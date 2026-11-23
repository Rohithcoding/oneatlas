import { getLabBySlug } from '@/lib/queries';
import { json, withErrors } from '@/lib/api';

export async function GET(_request: Request, ctx: RouteContext<'/api/labs/[slug]'>) {
  return withErrors(async () => {
    const { slug } = await ctx.params;
    const lab = await getLabBySlug(slug);
    if (!lab) throw new Error('LAB_NOT_FOUND');
    return json(lab);
  });
}

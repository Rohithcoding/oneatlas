import { getModelBySlug } from '@/lib/queries';
import { json, withErrors } from '@/lib/api';

/** GET /api/models/openai/gpt-6 — full model record. */
export async function GET(_request: Request, ctx: RouteContext<'/api/models/[...slug]'>) {
  return withErrors(async () => {
    const { slug } = await ctx.params;
    const model = await getModelBySlug(slug.join('/'));
    if (!model) throw new Error('MODEL_NOT_FOUND');
    return json(model);
  });
}

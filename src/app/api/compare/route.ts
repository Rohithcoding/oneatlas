import { getCompareModels } from '@/lib/queries';
import { compareQuerySchema } from '@/lib/validation';
import { json, withErrors } from '@/lib/api';

/** GET /api/compare?models=lab/model,lab/model — up to five full records. */
export async function GET(request: Request) {
  return withErrors(async () => {
    const { models } = compareQuerySchema.parse({
      models: new URL(request.url).searchParams.get('models') ?? '',
    });
    return json(await getCompareModels(models));
  });
}

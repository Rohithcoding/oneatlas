import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

const NOT_FOUND_CODES = new Set([
  'MODEL_NOT_FOUND',
  'BENCHMARK_NOT_FOUND',
  'CATEGORY_NOT_FOUND',
  'LAB_NOT_FOUND',
  'PROVIDER_NOT_FOUND',
]);

/** Consistent JSON error envelope for every API route. */
export async function withErrors(handler: () => Promise<Response>): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: {
            message: 'Invalid request parameters',
            details: error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
          },
        },
        { status: 400 }
      );
    }
    if (error instanceof Error && NOT_FOUND_CODES.has(error.message)) {
      return NextResponse.json({ error: { message: 'Resource not found', code: error.message } }, { status: 404 });
    }
    console.error('[API]', error);
    return NextResponse.json({ error: { message: 'Internal server error' } }, { status: 500 });
  }
}

export function json<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      ...init?.headers,
    },
  });
}

// tRPC API Route Handler for Next.js App Router
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';
import { createContext } from '@/server/trpc';

const handler = async (req: Request) => {
  // Log request info without consuming body
  console.log('🔍 tRPC Request:', {
    url: req.url,
    method: req.method,
    contentType: req.headers.get('content-type'),
  });

  const response = await fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? '<no-path>'}:`,
              error
            );
          }
        : undefined,
  });

  console.log('📤 tRPC Response status:', response.status);
  return response;
};

export { handler as GET, handler as POST };

// tRPC API Route Handler for Next.js App Router
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app';
import { createContext } from '@/server/trpc';

const handler = async (req: Request) => {
  console.log('🔍 tRPC Request:', {
    url: req.url,
    method: req.method,
    headers: Object.fromEntries(req.headers.entries()),
  });

  // Try to read and log body
  const clonedReq = req.clone();
  try {
    const body = await clonedReq.text();
    console.log('🔍 Request Body:', body);
  } catch (e) {
    console.log('🔍 Could not read body:', e);
  }

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`
            );
          }
        : undefined,
  });
};

export { handler as GET, handler as POST };

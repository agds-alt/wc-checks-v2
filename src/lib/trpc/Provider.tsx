'use client';

// tRPC Provider for Next.js App Router
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpLink } from '@trpc/client';
import { useState } from 'react';
import superjson from 'superjson';
import { trpc } from './client';

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000, // 5 seconds
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer: superjson,
      links: [
        httpLink({
          url: `${getBaseUrl()}/api/trpc`,
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: 'same-origin',
            });
          },
          headers() {
            // Get token from localStorage (stored by authStorage.ts)
            const token = typeof window !== 'undefined'
              ? localStorage.getItem('sb-auth-token')
              : null;

            return {
              authorization: token ? `Bearer ${token}` : '',
              'content-type': 'application/json',
            };
          },
        }),
      ],
    } as any)
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Browser should use relative url
    return '';
  }

  // SSR should use vercel url
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Dev SSR should use localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

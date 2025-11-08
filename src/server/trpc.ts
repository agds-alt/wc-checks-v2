// tRPC Server Configuration
import { initTRPC, TRPCError } from '@trpc/server';
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import superjson from 'superjson';
import { sessionService } from '@/infrastructure/auth/session';
import { jwtService } from '@/infrastructure/auth/jwt';

// Context type
export interface Context {
  user: {
    userId: string;
    email: string;
    role: number;
    organizationId: string;
    sessionId: string;
  } | null;
}

/**
 * Create context for each request
 */
export async function createContext(
  opts: FetchCreateContextFnOptions
): Promise<Context> {
  const authorization = opts.req.headers.get('authorization');
  const token = jwtService.extractTokenFromHeader(authorization ?? undefined);

  if (!token) {
    return { user: null };
  }

  // Validate session
  const sessionData = await sessionService.validateSession(token);

  if (!sessionData) {
    return { user: null };
  }

  return {
    user: {
      userId: sessionData.userId,
      email: sessionData.email,
      role: sessionData.role,
      organizationId: sessionData.organizationId,
      sessionId: sessionData.sessionId,
    },
  };
}

/**
 * Initialize tRPC with Superjson transformer
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

/**
 * Export reusable router and procedure helpers
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
  }

  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

/**
 * Admin procedure - requires admin role (90+)
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role < 90) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }

  return next({
    ctx,
  });
});

/**
 * Manager procedure - requires manager role (80+)
 */
export const managerProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role < 80) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Manager access required',
    });
  }

  return next({
    ctx,
  });
});

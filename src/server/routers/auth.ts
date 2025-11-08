// Auth Router
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { sessionService } from '@/infrastructure/auth/session';
import { UserRepository } from '@/infrastructure/database/repositories/UserRepository';

const userRepo = new UserRepository();

// Demo mode check (untuk testing tanpa Supabase)
const DEMO_MODE = !process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('your-project-id');

// Demo user untuk testing
const DEMO_USER = {
  id: 'demo-user-123',
  email: 'demo@test.com',
  name: 'Demo User',
  role: 90, // Admin role
  organization_id: 'demo-org-123',
  created_at: new Date(),
  updated_at: new Date(),
};

export const authRouter = router({
  /**
   * Login with email/password
   */
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      // DEMO MODE: Return demo user untuk testing
      if (DEMO_MODE) {
        console.log('🎭 DEMO MODE: Using mock user (Supabase not configured)');

        const token = await sessionService.createSession({
          userId: DEMO_USER.id,
          email: DEMO_USER.email,
          role: DEMO_USER.role,
          organizationId: DEMO_USER.organization_id,
        });

        return {
          token,
          user: {
            id: DEMO_USER.id,
            email: DEMO_USER.email,
            name: DEMO_USER.name,
            role: DEMO_USER.role,
            organizationId: DEMO_USER.organization_id,
          },
        };
      }

      // PRODUCTION MODE: Query database
      const user = await userRepo.findByEmail(input.email);

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        });
      }

      // TODO: Verify password with bcrypt
      // For now, we'll assume password is correct
      // In production, you should use bcrypt.compare(input.password, user.password)

      // Create session
      const token = await sessionService.createSession({
        userId: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organization_id,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organization_id,
        },
      };
    }),

  /**
   * Get current user
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    // DEMO MODE: Return demo user
    if (DEMO_MODE) {
      return DEMO_USER;
    }

    const user = await userRepo.findById(ctx.user.userId);

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    return user;
  }),

  /**
   * Refresh token
   */
  refresh: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const newToken = await sessionService.refreshSession(input.token);

      if (!newToken) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token',
        });
      }

      return { token: newToken };
    }),

  /**
   * Logout
   */
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    await sessionService.deleteSession(ctx.user.sessionId);
    return { success: true };
  }),

  /**
   * Register new user
   */
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(2),
        organizationId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Check if user exists
      const existingUser = await userRepo.findByEmail(input.email);

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User already exists',
        });
      }

      // TODO: Hash password with bcrypt
      // const hashedPassword = await bcrypt.hash(input.password, 10);

      // Create user
      const user = await userRepo.create({
        email: input.email,
        name: input.name,
        role: 0, // Default role
        organization_id: input.organizationId,
      });

      // Create session
      const token = await sessionService.createSession({
        userId: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organization_id,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organization_id,
        },
      };
    }),
});

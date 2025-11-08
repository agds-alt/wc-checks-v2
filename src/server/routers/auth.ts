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
  full_name: 'Demo User',
  phone: '+62812345678',
  profile_photo_url: null,
  is_active: true,
  occupation_id: null,
  password_hash: null,
  last_login_at: new Date(),
  created_at: new Date(),
  updated_at: new Date(),
};

const DEMO_ROLE_LEVEL = 90; // Admin role level

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
    .mutation(async ({ input, ctx }) => {
      console.log('🔍 Login mutation called');
      console.log('🔍 Input received:', JSON.stringify(input, null, 2));
      console.log('🔍 Context:', JSON.stringify(ctx, null, 2));

      // DEMO MODE: Return demo user untuk testing
      if (DEMO_MODE) {
        console.log('🎭 DEMO MODE: Using mock user (Supabase not configured)');

        const token = await sessionService.createSession({
          userId: DEMO_USER.id,
          email: DEMO_USER.email,
          role: DEMO_ROLE_LEVEL,
          organizationId: 'demo-org-123', // Mock organization ID for demo
        });

        const response = {
          token,
          user: {
            id: DEMO_USER.id,
            email: DEMO_USER.email,
            full_name: DEMO_USER.full_name,
            phone: DEMO_USER.phone,
            profile_photo_url: DEMO_USER.profile_photo_url,
            is_active: DEMO_USER.is_active,
            occupation_id: DEMO_USER.occupation_id,
            role: DEMO_ROLE_LEVEL,
            organizationId: 'demo-org-123',
          },
        };

        console.log('✅ Login successful, returning:', JSON.stringify(response, null, 2));
        return response;
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
      // In production, you should use bcrypt.compare(input.password, user.password_hash)

      // TODO: Get user's role level from user_roles table
      // For now, using default role level
      const roleLevel = 0;
      const organizationId = 'default-org'; // TODO: Get from user_roles or context

      // Create session
      const token = await sessionService.createSession({
        userId: user.id,
        email: user.email,
        role: roleLevel,
        organizationId: organizationId,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          profile_photo_url: user.profile_photo_url,
          is_active: user.is_active,
          occupation_id: user.occupation_id,
          role: roleLevel,
          organizationId: organizationId,
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
        full_name: z.string().min(2),
        phone: z.string().optional(),
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

      // Generate user ID (Supabase uses UUID)
      const userId = crypto.randomUUID();

      // Create user
      const user = await userRepo.create({
        id: userId,
        email: input.email,
        full_name: input.full_name,
        phone: input.phone || null,
        password_hash: input.password, // TODO: Hash this with bcrypt
      });

      // TODO: Create default user role in user_roles table
      const roleLevel = 0; // Default role level
      const organizationId = 'default-org'; // TODO: Assign organization

      // Create session
      const token = await sessionService.createSession({
        userId: user.id,
        email: user.email,
        role: roleLevel,
        organizationId: organizationId,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          profile_photo_url: user.profile_photo_url,
          is_active: user.is_active,
          occupation_id: user.occupation_id,
          role: roleLevel,
          organizationId: organizationId,
        },
      };
    }),
});

// Auth Router
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { sessionService } from '@/infrastructure/auth/session';
import { UserRepository } from '@/infrastructure/database/repositories/UserRepository';
import * as bcrypt from 'bcrypt';

const userRepo = new UserRepository();
const SALT_ROUNDS = 10; // bcrypt salt rounds

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

      // Query database for user
      const user = await userRepo.findByEmail(input.email);

      if (!user || !user.password_hash) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        });
      }

      // Verify password with bcrypt
      const isPasswordValid = await bcrypt.compare(input.password, user.password_hash);

      if (!isPasswordValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        });
      }

      // Get user's role level from user_roles table
      const userRoleData = await userRepo.getUserRoleLevel(user.id);
      const roleLevel = userRoleData?.level || 0;

      // Get default organization ID (or user's organization if implemented)
      const defaultOrg = await userRepo.getDefaultOrganization();
      const organizationId = defaultOrg?.id || 'unknown';

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
    const user = await userRepo.findById(ctx.user.userId);

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    // Return user with role and organizationId from context
    return {
      ...user,
      role: ctx.user.role,
      organizationId: ctx.user.organizationId,
    };
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

      // Hash password with bcrypt
      const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

      // Generate user ID (Supabase uses UUID)
      const userId = crypto.randomUUID();

      // Create user
      const user = await userRepo.create({
        id: userId,
        email: input.email,
        full_name: input.full_name,
        phone: input.phone || null,
        password_hash: hashedPassword,
      });

      // Assign default viewer role (TODO: Make role selectable during registration)
      const roleLevel = 10; // Viewer role level

      // Get default organization
      const defaultOrg = await userRepo.getDefaultOrganization();
      const organizationId = defaultOrg?.id || 'unknown';

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

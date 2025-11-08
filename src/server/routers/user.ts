// User Router
import { router, protectedProcedure, adminProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { UserRepository } from '@/infrastructure/database/repositories/UserRepository';

const userRepo = new UserRepository();

export const userRouter = router({
  /**
   * Get user by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const user = await userRepo.findById(input.id);

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      return user;
    }),

  /**
   * List users by organization
   */
  listByOrganization: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const orgId = input.organizationId || ctx.user.organizationId;
      return userRepo.findByOrganization(orgId);
    }),

  /**
   * Update user
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        role: z.number().optional(),
        organizationId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      return userRepo.update(id, updateData);
    }),

  /**
   * Delete user
   */
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await userRepo.delete(input.id);
      return { success: true };
    }),

  /**
   * List all users (paginated)
   */
  list: adminProcedure
    .input(
      z.object({
        limit: z.number().default(100),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      return userRepo.list(input.limit, input.offset);
    }),
});

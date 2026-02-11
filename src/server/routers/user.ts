// User Router
import { router, protectedProcedure, adminProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { UserRepository } from '@/infrastructure/database/repositories/UserRepository';
import { createClient } from '@supabase/supabase-js';

const userRepo = new UserRepository();

// Helper to check user limit
async function checkUserLimit(organizationId: string): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get organization's current plan
  const { data: org } = await supabase
    .from('organizations')
    .select('current_plan_id')
    .eq('id', organizationId)
    .single();

  if (!org?.current_plan_id) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Organization plan not found',
    });
  }

  // Get plan limits
  const { data: plan } = await supabase
    .from('plans')
    .select('max_users')
    .eq('id', org.current_plan_id)
    .single();

  if (!plan) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Plan not found',
    });
  }

  // -1 means unlimited
  if (plan.max_users === -1) {
    return;
  }

  // Count current users in organization
  const { count } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId);

  if (count !== null && count >= plan.max_users) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `You've reached the maximum number of users (${plan.max_users}) for your plan. Please upgrade to add more team members.`,
    });
  }
}

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
      // If changing organization, check user limit
      if (input.organizationId) {
        await checkUserLimit(input.organizationId);
      }

      const { id, name, ...restData } = input;
      const updateData: any = { ...restData };
      if (name) updateData.full_name = name;
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

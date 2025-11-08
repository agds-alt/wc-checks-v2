// Organization Router
import { router, protectedProcedure, adminProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { OrganizationRepository } from '@/infrastructure/database/repositories/OrganizationRepository';
import { cacheService } from '@/infrastructure/cache/redis';

const orgRepo = new OrganizationRepository();
const CACHE_TTL = 3600; // 1 hour

export const organizationRouter = router({
  /**
   * Get organization by ID (with caching)
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const cacheKey = `org:${input.id}`;

      // Try cache first
      const cached = await cacheService.get(cacheKey);
      if (cached) return cached;

      const org = await orgRepo.findById(input.id);

      if (!org) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Organization not found',
        });
      }

      // Cache result
      await cacheService.set(cacheKey, org, CACHE_TTL);

      return org;
    }),

  /**
   * List organizations by creator
   */
  listByCreator: protectedProcedure
    .input(
      z.object({
        creatorId: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const creatorId = input.creatorId || ctx.user.userId;
      return orgRepo.findByCreator(creatorId);
    }),

  /**
   * Create organization
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const org = await orgRepo.create({
        name: input.name,
        created_by: ctx.user.userId,
      });

      return org;
    }),

  /**
   * Update organization
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;

      const org = await orgRepo.update(id, updateData);

      // Invalidate cache
      await cacheService.del(`org:${id}`);

      return org;
    }),

  /**
   * Delete organization
   */
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await orgRepo.delete(input.id);

      // Invalidate cache
      await cacheService.del(`org:${input.id}`);

      return { success: true };
    }),

  /**
   * List all organizations (paginated)
   */
  list: adminProcedure
    .input(
      z.object({
        limit: z.number().default(100),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      return orgRepo.list(input.limit, input.offset);
    }),
});

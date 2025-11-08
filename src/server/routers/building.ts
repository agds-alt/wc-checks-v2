// Building Router
import { router, protectedProcedure, managerProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { BuildingRepository } from '@/infrastructure/database/repositories/BuildingRepository';
import { cacheService } from '@/infrastructure/cache/redis';

const buildingRepo = new BuildingRepository();
const CACHE_TTL = 3600; // 1 hour

export const buildingRouter = router({
  /**
   * Get building by ID (with caching)
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const cacheKey = `building:${input.id}`;

      // Try cache first
      const cached = await cacheService.get(cacheKey);
      if (cached) return cached;

      const building = await buildingRepo.findById(input.id);

      if (!building) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Building not found',
        });
      }

      // Cache result
      await cacheService.set(cacheKey, building, CACHE_TTL);

      return building;
    }),

  /**
   * List buildings by organization
   */
  listByOrganization: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const orgId = input.organizationId || ctx.user.organizationId;
      const cacheKey = `buildings:org:${orgId}`;

      // Try cache first
      const cached = await cacheService.get(cacheKey);
      if (cached) return cached;

      const buildings = await buildingRepo.findByOrganization(orgId);

      // Cache result
      await cacheService.set(cacheKey, buildings, CACHE_TTL);

      return buildings;
    }),

  /**
   * Create building
   */
  create: managerProcedure
    .input(
      z.object({
        name: z.string().min(2),
        address: z.string().optional(),
        organizationId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const building = await buildingRepo.create({
        name: input.name,
        address: input.address,
        organization_id: input.organizationId || ctx.user.organizationId,
        created_by: ctx.user.userId,
      });

      // Invalidate cache
      await cacheService.del(`buildings:org:${building.organization_id}`);

      return building;
    }),

  /**
   * Update building
   */
  update: managerProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).optional(),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;

      const building = await buildingRepo.update(id, updateData);

      // Invalidate cache
      await cacheService.del(`building:${id}`);
      await cacheService.del(`buildings:org:${building.organization_id}`);

      return building;
    }),

  /**
   * Delete building
   */
  delete: managerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const building = await buildingRepo.findById(input.id);

      if (!building) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Building not found',
        });
      }

      await buildingRepo.delete(input.id);

      // Invalidate cache
      await cacheService.del(`building:${input.id}`);
      await cacheService.del(`buildings:org:${building.organization_id}`);

      return { success: true };
    }),

  /**
   * List all buildings (paginated)
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(100),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      return buildingRepo.list(input.limit, input.offset);
    }),
});

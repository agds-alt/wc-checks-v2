// Inspection Router
import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { InspectionRepository } from '@/infrastructure/database/repositories/InspectionRepository';
import { cacheService } from '@/infrastructure/cache/redis';

const inspectionRepo = new InspectionRepository();
const CACHE_TTL = 1800; // 30 minutes (inspections change frequently)

export const inspectionRouter = router({
  /**
   * Get inspection by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const inspection = await inspectionRepo.findById(input.id);

      if (!inspection) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Inspection not found',
        });
      }

      return inspection;
    }),

  /**
   * Get inspection with components
   */
  getWithComponents: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const cacheKey = `inspection:full:${input.id}`;

      // Try cache first
      const cached = await cacheService.get(cacheKey);
      if (cached) return cached;

      const inspection = await inspectionRepo.findById(input.id);

      if (!inspection) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Inspection not found',
        });
      }

      const components = await inspectionRepo.getComponents(input.id);

      const result = {
        ...inspection,
        components,
      };

      // Cache result
      await cacheService.set(cacheKey, result, CACHE_TTL);

      return result;
    }),

  /**
   * List inspections by location
   */
  listByLocation: protectedProcedure
    .input(
      z.object({
        locationId: z.string(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      return inspectionRepo.findByLocation(input.locationId, input.limit);
    }),

  /**
   * List inspections by inspector
   */
  listByInspector: protectedProcedure
    .input(
      z.object({
        inspectorId: z.string().optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      const inspectorId = input.inspectorId || ctx.user.userId;
      return inspectionRepo.findByInspector(inspectorId, input.limit);
    }),

  /**
   * List inspections by date range
   */
  listByDateRange: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      return inspectionRepo.findByDateRange(input.startDate, input.endDate);
    }),

  /**
   * Create inspection
   */
  create: protectedProcedure
    .input(
      z.object({
        locationId: z.string(),
        inspectionDate: z.date(),
        overallRating: z.number().min(1).max(4),
        notes: z.string().optional(),
        components: z.array(
          z.object({
            componentName: z.string(),
            rating: z.number().min(1).max(4),
            notes: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const inspection = await inspectionRepo.create({
        location_id: input.locationId,
        inspector_id: ctx.user.userId,
        inspection_date: input.inspectionDate,
        overall_rating: input.overallRating,
        notes: input.notes,
        created_by: ctx.user.userId,
        components: input.components.map((c) => ({
          component_name: c.componentName,
          rating: c.rating,
          notes: c.notes,
        })),
      });

      // Invalidate cache
      await cacheService.delPattern(`inspection:*`);

      return inspection;
    }),

  /**
   * Update inspection
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        overallRating: z.number().min(1).max(4).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;

      const inspection = await inspectionRepo.update(id, {
        overall_rating: updateData.overallRating,
        notes: updateData.notes,
      });

      // Invalidate cache
      await cacheService.del(`inspection:full:${id}`);

      return inspection;
    }),

  /**
   * Delete inspection
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await inspectionRepo.delete(input.id);

      // Invalidate cache
      await cacheService.del(`inspection:full:${input.id}`);

      return { success: true };
    }),

  /**
   * List all inspections (paginated)
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(100),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      return inspectionRepo.list(input.limit, input.offset);
    }),
});

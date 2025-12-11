// Location Router
import { router, protectedProcedure, managerProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { LocationRepository } from '@/infrastructure/database/repositories/LocationRepository';
import { cacheService } from '@/infrastructure/cache/redis';

const locationRepo = new LocationRepository();
const CACHE_TTL = 3600; // 1 hour

export const locationRouter = router({
  /**
   * Get location by ID (with caching)
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const cacheKey = `location:${input.id}`;

      // Try cache first
      const cached = await cacheService.get(cacheKey);
      if (cached) return cached;

      const location = await locationRepo.findById(input.id);

      if (!location) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Location not found',
        });
      }

      // Cache result
      await cacheService.set(cacheKey, location, CACHE_TTL);

      return location;
    }),

  /**
   * Get location by QR code
   */
  getByQRCode: protectedProcedure
    .input(z.object({ qrCode: z.string() }))
    .query(async ({ input }) => {
      const cacheKey = `location:qr:${input.qrCode}`;

      // Try cache first
      const cached = await cacheService.get(cacheKey);
      if (cached) return cached;

      const location = await locationRepo.findByQRCode(input.qrCode);

      if (!location) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Location not found',
        });
      }

      // Cache result
      await cacheService.set(cacheKey, location, CACHE_TTL);

      return location;
    }),

  /**
   * List locations by building
   */
  listByBuilding: protectedProcedure
    .input(
      z.object({
        buildingId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const cacheKey = `locations:building:${input.buildingId}`;

      // Try cache first
      const cached = await cacheService.get(cacheKey);
      if (cached) return cached;

      const locations = await locationRepo.findByBuilding(input.buildingId);

      // Cache result
      await cacheService.set(cacheKey, locations, CACHE_TTL);

      return locations;
    }),

  /**
   * Create location
   */
  create: managerProcedure
    .input(
      z.object({
        qrCode: z.string(),
        name: z.string().min(2),
        floor: z.string().optional(),
        buildingId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const location = await locationRepo.create({
        code: `LOC-${Date.now()}`, // Auto-generate code
        qr_code: input.qrCode,
        name: input.name,
        floor: input.floor,
        building_id: input.buildingId,
        organization_id: ctx.user.organizationId,
        created_by: ctx.user.userId,
      });

      // Invalidate cache
      await cacheService.del(`locations:building:${input.buildingId}`);

      return location;
    }),

  /**
   * Update location
   */
  update: managerProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).optional(),
        floor: z.string().optional(),
        qrCode: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, qrCode, ...updateData } = input;

      const updatePayload = {
        ...updateData,
        ...(qrCode && { qr_code: qrCode }),
      };

      const location = await locationRepo.update(id, updatePayload);

      // Invalidate cache
      await cacheService.del(`location:${id}`);
      if (location.qr_code) {
        await cacheService.del(`location:qr:${location.qr_code}`);
      }
      await cacheService.del(`locations:building:${location.building_id}`);

      return location;
    }),

  /**
   * Delete location
   */
  delete: managerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const location = await locationRepo.findById(input.id);

      if (!location) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Location not found',
        });
      }

      await locationRepo.delete(input.id);

      // Invalidate cache
      await cacheService.del(`location:${input.id}`);
      await cacheService.del(`location:qr:${location.qr_code}`);
      await cacheService.del(`locations:building:${location.building_id}`);

      return { success: true };
    }),

  /**
   * List all locations (paginated)
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(100),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      return locationRepo.list(input.limit, input.offset);
    }),
});

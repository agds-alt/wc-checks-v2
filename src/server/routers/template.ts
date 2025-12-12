// Template Router
import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { TemplateRepository } from '@/infrastructure/database/repositories/TemplateRepository';
import { cacheService } from '@/infrastructure/cache/redis';

const templateRepo = new TemplateRepository();
const CACHE_TTL = 3600; // 1 hour - templates rarely change

export const templateRouter = router({
  /**
   * Get default template
   */
  getDefault: protectedProcedure
    .query(async () => {
      const cacheKey = 'template:default';

      // Try cache first
      const cached = await cacheService.get(cacheKey);
      if (cached) return cached;

      const template = await templateRepo.findDefault();

      if (!template) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No default template found. Please contact admin.',
        });
      }

      // Cache result
      await cacheService.set(cacheKey, template, CACHE_TTL);

      return template;
    }),

  /**
   * Get template by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const cacheKey = `template:${input.id}`;

      // Try cache first
      const cached = await cacheService.get(cacheKey);
      if (cached) return cached;

      const template = await templateRepo.findById(input.id);

      if (!template) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Template not found',
        });
      }

      // Cache result
      await cacheService.set(cacheKey, template, CACHE_TTL);

      return template;
    }),

  /**
   * List all active templates
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(100),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      return templateRepo.list(input.limit, input.offset);
    }),
});

// Inspection Router
import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { InspectionRepository } from '@/infrastructure/database/repositories/InspectionRepository';
import { cacheService } from '@/infrastructure/cache/redis';
import { createClient } from '@supabase/supabase-js';

const inspectionRepo = new InspectionRepository();
const CACHE_TTL = 1800; // 30 minutes (inspections change frequently)

// Helper to check inspection limit
async function checkInspectionLimit(organizationId: string): Promise<void> {
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
    .select('max_inspections_per_month')
    .eq('id', org.current_plan_id)
    .single();

  if (!plan) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Plan not found',
    });
  }

  // null or -1 means unlimited
  if (!plan.max_inspections_per_month || plan.max_inspections_per_month === -1) {
    return;
  }

  // Get start and end of current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Count inspections this month for this organization
  // Join with locations to filter by organization
  const { count } = await supabase
    .from('inspection_records')
    .select('*, locations!inner(organization_id)', { count: 'exact', head: true })
    .eq('locations.organization_id', organizationId)
    .gte('inspection_date', startOfMonth.toISOString().split('T')[0])
    .lte('inspection_date', endOfMonth.toISOString().split('T')[0]);

  if (count !== null && count >= plan.max_inspections_per_month) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `You've reached the maximum number of inspections (${plan.max_inspections_per_month}) for this month. Please upgrade your plan.`,
    });
  }
}

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
   * Create inspection record (from mobile form)
   */
  submitRecord: protectedProcedure
    .input(
      z.object({
        location_id: z.string(),
        template_id: z.string(),
        inspection_date: z.string(), // Format: YYYY-MM-DD
        inspection_time: z.string(), // Format: HH:MM:SS
        inspection_data: z.any(), // JSON with ratings, photos, etc.
        overall_rating: z.number(),
        status: z.string(),
        notes: z.string().optional(),
        duration_minutes: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check inspection limit before creating
      await checkInspectionLimit(ctx.user.organizationId);

      const { data, error } = await inspectionRepo['supabase']
        .from('inspection_records')
        .insert({
          location_id: input.location_id,
          inspector_id: ctx.user.userId,
          template_id: input.template_id,
          inspection_date: input.inspection_date,
          inspection_time: input.inspection_time,
          inspection_data: input.inspection_data,
          overall_rating: input.overall_rating,
          status: input.status,
          notes: input.notes,
          duration_minutes: input.duration_minutes,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create inspection: ${error.message}`,
        });
      }

      // Invalidate cache
      await cacheService.delPattern(`inspection:*`);
      await cacheService.delPattern(`location:*`);

      return data;
    }),

  /**
   * Create inspection (legacy - for components-based)
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
      // Check inspection limit before creating
      await checkInspectionLimit(ctx.user.organizationId);

      const inspection = await inspectionRepo.create({
        location_id: input.locationId,
        inspector_id: ctx.user.userId,
        inspection_date: input.inspectionDate.toISOString(),
        inspection_data: {}, // Required field
        overall_rating: input.overallRating,
        notes: input.notes,
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
        limit: z.number().default(1000),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      return inspectionRepo.list(input.limit, input.offset);
    }),

  /**
   * Get monthly report (aggregated by date)
   * Admin (role >= 80) can see all users, regular users see only their own
   */
  getMonthlyReport: protectedProcedure
    .input(
      z.object({
        month: z.string(), // Format: YYYY-MM
        userId: z.string().optional(), // Optional filter by user
      })
    )
    .query(async ({ input, ctx }) => {
      console.log('📊 [tRPC] getMonthlyReport called:', {
        month: input.month,
        requestedUserId: input.userId,
        currentUser: ctx.user.userId,
        userRole: ctx.user.role,
      });

      // Determine filter userId based on role
      let filterUserId: string | undefined;

      if (ctx.user.role >= 80) {
        // Admin: can see all users or specific user if requested
        filterUserId = input.userId;
        console.log('📊 [tRPC] Admin access - filtering by:', filterUserId || 'ALL USERS');
      } else {
        // Regular user: can only see their own data
        filterUserId = ctx.user.userId;
        console.log('📊 [tRPC] Regular user - filtering by own ID:', filterUserId);
      }

      // Parse month to start/end dates
      const [year, month] = input.month.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of month

      console.log('📊 [tRPC] Date range:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      // Fetch inspections from repository
      const inspections = await inspectionRepo.findByDateRange(
        startDate,
        endDate,
        filterUserId
      );

      console.log('📊 [tRPC] Found inspections:', inspections.length);

      // Group by date and calculate stats
      const dateMap = new Map<string, any[]>();

      inspections.forEach((inspection: any) => {
        const date = inspection.inspection_date.split('T')[0]; // Get YYYY-MM-DD
        if (!dateMap.has(date)) {
          dateMap.set(date, []);
        }
        dateMap.get(date)!.push(inspection);
      });

      // Format response
      const result = Array.from(dateMap.entries()).map(([date, dayInspections]) => {
        const totalScore = dayInspections.reduce(
          (sum, i) => sum + (i.overall_rating || 0),
          0
        );
        const avgScore = dayInspections.length > 0
          ? Math.round((totalScore / dayInspections.length) * 25) // Convert to 0-100 scale
          : 0;

        return {
          date,
          count: dayInspections.length,
          averageScore: avgScore,
        };
      });

      console.log('📊 [tRPC] Returning aggregated data:', result.length, 'dates');

      return result;
    }),

  /**
   * Get inspections for specific date
   * Admin (role >= 80) can see all users, regular users see only their own
   */
  getByDate: protectedProcedure
    .input(
      z.object({
        date: z.string(), // Format: YYYY-MM-DD
        userId: z.string().optional(), // Optional filter by user
      })
    )
    .query(async ({ input, ctx }) => {
      console.log('📅 [tRPC] getByDate called:', {
        date: input.date,
        requestedUserId: input.userId,
        currentUser: ctx.user.userId,
        userRole: ctx.user.role,
      });

      // Determine filter userId based on role
      let filterUserId: string | undefined;

      if (ctx.user.role >= 80) {
        // Admin: can see all users or specific user if requested
        filterUserId = input.userId;
        console.log('📅 [tRPC] Admin access - filtering by:', filterUserId || 'ALL USERS');
      } else {
        // Regular user: can only see their own data
        filterUserId = ctx.user.userId;
        console.log('📅 [tRPC] Regular user - filtering by own ID:', filterUserId);
      }

      // Parse date to start/end of day
      const startDate = new Date(input.date + 'T00:00:00');
      const endDate = new Date(input.date + 'T23:59:59');

      console.log('📅 [tRPC] Date range:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      // Fetch inspections from repository
      const inspections = await inspectionRepo.findByDateRange(
        startDate,
        endDate,
        filterUserId
      );

      console.log('📅 [tRPC] Found inspections:', inspections.length);

      return inspections;
    }),
});

// Stats Router - Admin Dashboard Statistics
import { router, protectedProcedure } from '../trpc';
import { getSupabaseServerClient } from '@/infrastructure/database/supabase/client';
import { TRPCError } from '@trpc/server';

export const statsRouter = router({
  /**
   * Get admin dashboard statistics
   * Available to all authenticated users
   */
  getAdminStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const supabase = getSupabaseServerClient();

      // Calculate dates
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Parallel queries for better performance
      const [
        usersResult,
        locationsResult,
        inspectionsResult,
        todayInspectionsResult,
        yesterdayInspectionsResult,
        activeUsersResult,
        recentInspectionsResult,
      ] = await Promise.all([
        // Total active users
        supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true),

        // Total active locations
        supabase
          .from('locations')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true),

        // Total inspections (bypass 1000 row limit with range)
        supabase
          .from('inspection_records')
          .select('*', { count: 'exact', head: true })
          .range(0, 999999), // Allow counting up to 1M records

        // Today's inspections
        supabase
          .from('inspection_records')
          .select('*', { count: 'exact', head: true })
          .eq('inspection_date', today)
          .range(0, 999999),

        // Yesterday's inspections
        supabase
          .from('inspection_records')
          .select('*', { count: 'exact', head: true })
          .eq('inspection_date', yesterday)
          .range(0, 999999),

        // Active users (logged in last 7 days)
        supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .gte('last_login_at', weekAgo)
          .eq('is_active', true),

        // Recent inspections for score calculation
        supabase
          .from('inspection_records')
          .select('responses')
          .limit(100),
      ]);

      // Calculate average score from responses
      const calculateScore = (responses: any): number => {
        if (!responses || typeof responses !== 'object') return 0;

        const values = Object.values(responses);
        if (values.length === 0) return 0;

        const goodCount = values.filter((v) => {
          if (typeof v === 'boolean') return v;
          if (typeof v === 'string') {
            const lowerV = v.toLowerCase();
            return (
              lowerV === 'good' ||
              lowerV === 'excellent' ||
              lowerV === 'baik' ||
              lowerV === 'bersih' ||
              lowerV === 'ada'
            );
          }
          return false;
        }).length;

        return Math.round((goodCount / values.length) * 100);
      };

      const inspections = recentInspectionsResult.data || [];
      const avgScore =
        inspections.length > 0
          ? Math.round(
              inspections.reduce((sum: number, i: any) => sum + calculateScore(i.responses), 0) /
                inspections.length
            )
          : 0;

      // Calculate growth metrics
      const todayCount = todayInspectionsResult.count || 0;
      const yesterdayCount = yesterdayInspectionsResult.count || 0;
      const inspectionGrowth =
        yesterdayCount > 0
          ? Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100)
          : 0;

      const stats = {
        totalUsers: usersResult.count || 0,
        totalLocations: locationsResult.count || 0,
        totalInspections: inspectionsResult.count || 0,
        todayInspections: todayCount,
        activeUsers: activeUsersResult.count || 0,
        avgScore,
        userGrowth: 0, // Can be calculated with historical data
        inspectionGrowth,
      };

      console.log('[stats.getAdminStats] Success - returning stats for user:', ctx.user.userId);

      return stats;
    } catch (error: any) {
      console.error('[stats.getAdminStats] Error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve statistics: ' + error.message,
      });
    }
  }),
});

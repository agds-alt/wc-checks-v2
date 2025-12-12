// src/hooks/useInspection.ts - MIGRATED TO TRPC
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { trpc } from '@/lib/trpc/client';

export const useInspection = (inspectionId?: string) => {
  const queryClient = useQueryClient();
  const trpcUtils = trpc.useUtils(); // ✅ Get tRPC utils for cache invalidation

  // ✅ Migrated to tRPC
  const getInspection = trpc.inspection.getById.useQuery(
    { id: inspectionId || '' },
    { enabled: !!inspectionId }
  );

  // ✅ Migrated to tRPC
  const getDefaultTemplate = trpc.template.getDefault.useQuery(undefined, {
    retry: 1,
  });

  // ✅ Migrated to tRPC
  const useGetLocation = (locationId: string) =>
    trpc.location.getById.useQuery(
      { id: locationId },
      { enabled: !!locationId }
    );

  const useSubmitInspection = () => trpc.inspection.submitRecord.useMutation({
    onSuccess: () => {
      // ✅ Invalidate tRPC queries using tRPC utils
      trpcUtils.inspection.getMonthlyReport.invalidate(); // 🔥 Refresh calendar
      trpcUtils.inspection.getByDate.invalidate(); // 🔥 Refresh date details
      trpcUtils.inspection.list.invalidate(); // 🔥 Refresh inspection list
      trpcUtils.inspection.listByLocation.invalidate(); // 🔥 Refresh location inspections

      // Also invalidate old query keys for backward compatibility
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      queryClient.invalidateQueries({ queryKey: ['location-inspections'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error) => {
      logger.error('Inspection mutation failed', error);
    },
  });

  const useGetLocationInspections = (locationId: string) => useQuery({
    queryKey: ['location-inspections', locationId],
    queryFn: async () => {
      if (!locationId) return [];

      const { data, error } = await (supabase
        .from('inspection_records')
        .select(`
          *,
          users:inspector_id (
            full_name,
            email
          )
        `) as any)
        .eq('location_id', locationId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to fetch location inspections', error);
        throw new Error(`Failed to fetch inspections: ${error.message}`);
      }

      return data;
    },
    enabled: !!locationId,
  });

  return {
    getInspection,
    getDefaultTemplate,
    useGetLocation,
    useSubmitInspection,
    useGetLocationInspections,
  };
};
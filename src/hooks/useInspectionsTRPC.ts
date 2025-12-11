// src/hooks/useInspectionsTRPC.ts - tRPC-based Inspections hooks
import { trpc } from '@/lib/trpc/client';

/**
 * Fetch current user's inspections via tRPC
 * Uses listByInspector which defaults to current user
 */
export function useInspections(limit: number = 50) {
  return trpc.inspection.listByInspector.useQuery({
    limit,
  });
}

/**
 * Fetch ALL inspections via tRPC (Admin only)
 * Uses the list procedure with high limit
 */
export function useAdminInspections(limit: number = 1000) {
  return trpc.inspection.list.useQuery({
    limit,
    offset: 0,
  });
}

/**
 * Fetch single inspection by ID via tRPC
 */
export function useInspection(inspectionId?: string) {
  return trpc.inspection.getById.useQuery(
    { id: inspectionId! },
    {
      enabled: !!inspectionId, // Only fetch if ID exists
    }
  );
}

/**
 * Fetch inspection with components
 */
export function useInspectionWithComponents(inspectionId?: string) {
  return trpc.inspection.getWithComponents.useQuery(
    { id: inspectionId! },
    {
      enabled: !!inspectionId,
    }
  );
}

/**
 * Create new inspection via tRPC
 */
export function useCreateInspection() {
  const utils = trpc.useContext();

  return trpc.inspection.create.useMutation({
    onSuccess: () => {
      // Invalidate and refetch inspections
      utils.inspection.listByInspector.invalidate();
      utils.inspection.list.invalidate();
    },
  });
}

/**
 * Update inspection via tRPC
 */
export function useUpdateInspection() {
  const utils = trpc.useContext();

  return trpc.inspection.update.useMutation({
    onSuccess: (data) => {
      // Invalidate related queries
      utils.inspection.getById.invalidate({ id: data.id });
      utils.inspection.listByInspector.invalidate();
      utils.inspection.list.invalidate();
    },
  });
}

/**
 * Delete inspection via tRPC
 */
export function useDeleteInspection() {
  const utils = trpc.useContext();

  return trpc.inspection.delete.useMutation({
    onSuccess: () => {
      // Invalidate inspections list
      utils.inspection.listByInspector.invalidate();
      utils.inspection.list.invalidate();
    },
  });
}

/**
 * List inspections by location
 */
export function useInspectionsByLocation(locationId?: string, limit: number = 50) {
  return trpc.inspection.listByLocation.useQuery(
    { locationId: locationId!, limit },
    {
      enabled: !!locationId,
    }
  );
}

/**
 * List inspections by date range
 */
export function useInspectionsByDateRange(startDate?: Date, endDate?: Date) {
  return trpc.inspection.listByDateRange.useQuery(
    { startDate: startDate!, endDate: endDate! },
    {
      enabled: !!startDate && !!endDate,
    }
  );
}

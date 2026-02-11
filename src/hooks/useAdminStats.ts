// src/hooks/useAdminStats.ts - Admin Dashboard Statistics via tRPC
import { trpc } from '@/lib/trpc/client';

export interface AdminStats {
  totalUsers: number;
  totalLocations: number;
  totalInspections: number;
  todayInspections: number;
  activeUsers: number;
  avgScore: number;
  userGrowth: number;
  inspectionGrowth: number;
}

// Fetch admin dashboard statistics via tRPC
export function useAdminStats() {
  return trpc.stats.getAdminStats.useQuery(undefined, {
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });
}

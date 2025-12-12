// src/hooks/useReports.ts - tRPC VERSION
import { trpc } from '@/lib/trpc/client';
import { format } from 'date-fns';

export interface InspectionReport {
  id: string;
  inspection_date: string;
  inspection_time: string;
  overall_status: string;
  responses: any;
  location: {
    id: string;
    name: string;
    building: string;
    floor: string;
  };
  user: {
    id: string;
    full_name: string;
    email: string;
    occupation_id?: string;
  };
  occupation?: {
    id: string;
    display_name: string;
    description?: string;
    color?: string;
    icon?: string;
  } | null;
  photo_urls: string[];
  notes: string | null;
}

export interface DateInspections {
  date: string;
  inspections: InspectionReport[];
  averageScore: number;
  count: number;
}

/**
 * Get inspections for a specific month (tRPC version)
 *
 * @param userId - Optional. If provided, filters to specific user. If not provided:
 *   - Admin (level >= 80): fetches ALL users' inspections
 *   - Regular user: fetches their own inspections (enforced by backend)
 * @param currentDate - The month to fetch data for
 * @param enabled - Whether to enable the query (default true)
 */
export const useMonthlyInspections = (
  userId: string | undefined,
  currentDate: Date,
  enabled: boolean = true
) => {
  const month = format(currentDate, 'yyyy-MM');

  console.log('📅 [Hook] useMonthlyInspections:', { userId: userId || 'auto', month, enabled });

  return trpc.inspection.getMonthlyReport.useQuery(
    {
      month,
      userId,
    },
    {
      enabled,
    }
  );
};

/**
 * Get inspections for a specific date (tRPC version)
 *
 * @param userId - Optional. If provided, filters to specific user. If not provided:
 *   - Admin (level >= 80): fetches ALL users' inspections
 *   - Regular user: fetches their own inspections (enforced by backend)
 * @param date - The specific date to fetch data for (YYYY-MM-DD)
 * @param enabled - Whether to enable the query (default true)
 */
export const useDateInspections = (
  userId: string | undefined,
  date: string,
  enabled: boolean = true
) => {
  console.log('📅 [Hook] useDateInspections:', { userId: userId || 'auto', date, enabled: enabled && !!date });

  return trpc.inspection.getByDate.useQuery(
    {
      date,
      userId,
    },
    {
      enabled: enabled && !!date,
    }
  );
};

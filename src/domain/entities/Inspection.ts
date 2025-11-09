// Domain Entity: Inspection (renamed from inspection_records in DB)
export interface Inspection {
  id: string;
  location_id: string;
  inspector_id: string;
  inspection_date: string; // ISO date string from DB
  inspection_time: string; // ISO time string from DB
  template_id: string | null;
  inspection_data: any; // JSON field containing all inspection component data
  overall_rating: number | null;
  duration_minutes: number | null;
  status: string | null;
  notes: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface CreateInspectionInput {
  location_id: string;
  inspector_id: string;
  inspection_date?: string;
  inspection_time?: string;
  template_id?: string | null;
  inspection_data: any;
  overall_rating?: number | null;
  duration_minutes?: number | null;
  status?: string | null;
  notes?: string | null;
  components?: any[]; // Optional inspection components
}

export interface UpdateInspectionInput {
  inspection_date?: string;
  inspection_time?: string;
  template_id?: string | null;
  inspection_data?: any;
  overall_rating?: number | null;
  duration_minutes?: number | null;
  status?: string | null;
  notes?: string | null;
}

// Inspection rating constants
export const INSPECTION_RATINGS = {
  EXCELLENT: 4,
  GOOD: 3,
  FAIR: 2,
  POOR: 1,
} as const;

export type InspectionRating = typeof INSPECTION_RATINGS[keyof typeof INSPECTION_RATINGS];

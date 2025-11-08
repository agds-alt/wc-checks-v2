// Domain Entity: Inspection
export interface Inspection {
  id: string;
  location_id: string;
  inspector_id: string;
  inspection_date: Date;
  overall_rating: number;
  notes?: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface InspectionComponent {
  id: string;
  inspection_id: string;
  component_name: string;
  rating: number;
  notes?: string;
  created_at: Date;
}

export interface CreateInspectionInput {
  location_id: string;
  inspector_id: string;
  inspection_date: Date;
  overall_rating: number;
  notes?: string;
  created_by: string;
  components: Array<{
    component_name: string;
    rating: number;
    notes?: string;
  }>;
}

export interface UpdateInspectionInput {
  overall_rating?: number;
  notes?: string;
}

// Inspection rating constants
export const INSPECTION_RATINGS = {
  EXCELLENT: 4,
  GOOD: 3,
  FAIR: 2,
  POOR: 1,
} as const;

export type InspectionRating = typeof INSPECTION_RATINGS[keyof typeof INSPECTION_RATINGS];

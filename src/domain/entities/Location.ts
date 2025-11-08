// Domain Entity: Location (Toilet Location)
export interface Location {
  id: string;
  code: string;
  name: string;
  description: string | null;
  floor: string | null;
  section: string | null;
  area: string | null;
  coordinates: any | null; // JSON field for coordinates
  qr_code: string | null;
  photo_url: string | null;
  building_id: string;
  organization_id: string;
  is_active: boolean | null;
  created_by: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface CreateLocationInput {
  code: string;
  name: string;
  description?: string | null;
  floor?: string | null;
  section?: string | null;
  area?: string | null;
  coordinates?: any | null;
  qr_code?: string | null;
  photo_url?: string | null;
  building_id: string;
  organization_id: string;
  is_active?: boolean;
  created_by?: string | null;
}

export interface UpdateLocationInput {
  code?: string;
  name?: string;
  description?: string | null;
  floor?: string | null;
  section?: string | null;
  area?: string | null;
  coordinates?: any | null;
  qr_code?: string | null;
  photo_url?: string | null;
  is_active?: boolean;
}

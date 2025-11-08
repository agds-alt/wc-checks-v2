// Domain Entity: Location (Toilet Location)
export interface Location {
  id: string;
  qr_code: string;
  name: string;
  floor?: string;
  building_id: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateLocationInput {
  qr_code: string;
  name: string;
  floor?: string;
  building_id: string;
  created_by: string;
}

export interface UpdateLocationInput {
  name?: string;
  floor?: string;
  qr_code?: string;
}

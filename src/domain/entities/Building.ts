// Domain Entity: Building
export interface Building {
  id: string;
  code: string;
  name: string;
  address: string | null;
  description: string | null;
  type: string | null;
  photo_url: string | null;
  organization_id: string;
  is_active: boolean | null;
  created_by: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface CreateBuildingInput {
  code: string;
  name: string;
  address?: string | null;
  description?: string | null;
  type?: string | null;
  photo_url?: string | null;
  organization_id: string;
  is_active?: boolean;
  created_by?: string | null;
}

export interface UpdateBuildingInput {
  code?: string;
  name?: string;
  address?: string | null;
  description?: string | null;
  type?: string | null;
  photo_url?: string | null;
  is_active?: boolean;
}

// Domain Entity: Building
export interface Building {
  id: string;
  name: string;
  address?: string;
  organization_id: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBuildingInput {
  name: string;
  address?: string;
  organization_id: string;
  created_by: string;
}

export interface UpdateBuildingInput {
  name?: string;
  address?: string;
}

// Domain Entity: Organization
export interface Organization {
  id: string;
  name: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateOrganizationInput {
  name: string;
  created_by: string;
}

export interface UpdateOrganizationInput {
  name?: string;
}

// Domain Entity: Organization
export interface Organization {
  id: string;
  code: string;
  name: string;
  description: string | null;
  address: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  logo_url: string | null;
  is_active: boolean | null;
  created_by: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface CreateOrganizationInput {
  code: string;
  name: string;
  description?: string | null;
  address?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  logo_url?: string | null;
  is_active?: boolean;
  created_by?: string | null;
}

export interface UpdateOrganizationInput {
  code?: string;
  name?: string;
  description?: string | null;
  address?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  logo_url?: string | null;
  is_active?: boolean;
}

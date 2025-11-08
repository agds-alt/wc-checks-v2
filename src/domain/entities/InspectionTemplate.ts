// Domain Entity: InspectionTemplate
export interface InspectionTemplate {
  id: string;
  name: string;
  description: string | null;
  config: any; // JSON field
  version: string | null;
  is_default: boolean | null;
  is_active: boolean | null;
  created_by: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface CreateInspectionTemplateInput {
  name: string;
  description?: string | null;
  config: any;
  version?: string | null;
  is_default?: boolean;
  is_active?: boolean;
  created_by?: string | null;
}

export interface UpdateInspectionTemplateInput {
  name?: string;
  description?: string | null;
  config?: any;
  version?: string | null;
  is_default?: boolean;
  is_active?: boolean;
}

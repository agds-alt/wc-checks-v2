// Domain Entity: Role
export interface Role {
  id: string;
  name: string;
  level: number;
  description: string | null;
  is_active: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface CreateRoleInput {
  name: string;
  level: number;
  description?: string | null;
  is_active?: boolean;
}

export interface UpdateRoleInput {
  name?: string;
  level?: number;
  description?: string | null;
  is_active?: boolean;
}

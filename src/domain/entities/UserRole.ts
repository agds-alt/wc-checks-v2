// Domain Entity: UserRole (Junction table for users and roles)
export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_by: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface CreateUserRoleInput {
  user_id: string;
  role_id: string;
  assigned_by?: string | null;
}

export interface UpdateUserRoleInput {
  role_id?: string;
  assigned_by?: string | null;
}

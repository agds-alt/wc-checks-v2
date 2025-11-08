// Domain Entity: UserOccupation
export interface UserOccupation {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  is_active: boolean | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface CreateUserOccupationInput {
  name: string;
  display_name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  is_active?: boolean;
}

export interface UpdateUserOccupationInput {
  name?: string;
  display_name?: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  is_active?: boolean;
}

// Domain Entity: User
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  profile_photo_url: string | null;
  is_active: boolean | null;
  occupation_id: string | null;
  password_hash: string | null;
  last_login_at: Date | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface UserWithRole extends User {
  role_level: number;
  role_name: string;
}

export interface CreateUserInput {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  profile_photo_url?: string | null;
  occupation_id?: string | null;
  password_hash?: string | null;
}

export interface UpdateUserInput {
  full_name?: string;
  phone?: string | null;
  profile_photo_url?: string | null;
  occupation_id?: string | null;
  is_active?: boolean;
}

// Domain Entity: User
export interface User {
  id: string;
  email: string;
  name: string;
  role: number;
  organization_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  email: string;
  name: string;
  role: number;
  organization_id: string;
}

export interface UpdateUserInput {
  name?: string;
  role?: number;
  organization_id?: string;
}

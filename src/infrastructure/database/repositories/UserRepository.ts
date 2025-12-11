// User Repository Implementation
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { User, CreateUserInput, UpdateUserInput } from '@/domain/entities/User';
import { getSupabaseServerClient } from '../supabase/client';

export class UserRepository implements IUserRepository {
  private supabase = getSupabaseServerClient();

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async findByOrganization(_organizationId: string): Promise<User[]> {
    // Note: Users are no longer directly linked to organizations in the new schema
    // This method is deprecated. Use UserRole relationships instead
    console.warn('findByOrganization is deprecated - users are not directly linked to organizations');
    return [];
  }

  async create(input: CreateUserInput): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert([input])
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create user: ${error?.message}`);
    }

    return this.mapToEntity(data);
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update user: ${error?.message}`);
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  async list(limit: number = 100, offset: number = 0): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .range(offset, offset + limit - 1);

    if (error || !data) return [];
    return data.map(this.mapToEntity);
  }

  async getUserRoleLevel(userId: string): Promise<{ level: number; roleName: string } | null> {
    const { data, error } = await this.supabase
      .from('user_roles')
      .select('role_id, roles(name, level)')
      .eq('user_id', userId)
      .order('roles(level)', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;

    const role = data.roles as any;
    return {
      level: role?.level || 0,
      roleName: role?.name || 'viewer',
    };
  }

  async getDefaultOrganization(): Promise<{ id: string; name: string } | null> {
    const { data, error } = await this.supabase
      .from('organizations')
      .select('id, name')
      .eq('short_code', 'DEFAULT')
      .single();

    if (error || !data) return null;
    return {
      id: data.id,
      name: data.name,
    };
  }

  private mapToEntity(data: any): User {
    return {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      phone: data.phone,
      profile_photo_url: data.profile_photo_url,
      is_active: data.is_active,
      occupation_id: data.occupation_id,
      password_hash: data.password_hash,
      last_login_at: data.last_login_at ? new Date(data.last_login_at) : null,
      created_at: data.created_at ? new Date(data.created_at) : null,
      updated_at: data.updated_at ? new Date(data.updated_at) : null,
    };
  }
}

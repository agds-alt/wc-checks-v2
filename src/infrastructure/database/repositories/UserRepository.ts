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

  async findByOrganization(organizationId: string): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('organization_id', organizationId);

    if (error || !data) return [];
    return data.map(this.mapToEntity);
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

  private mapToEntity(data: any): User {
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      organization_id: data.organization_id,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    };
  }
}

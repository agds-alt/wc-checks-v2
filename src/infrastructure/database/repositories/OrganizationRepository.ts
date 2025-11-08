// Organization Repository Implementation
import { IOrganizationRepository } from '@/domain/repositories/IOrganizationRepository';
import { Organization, CreateOrganizationInput, UpdateOrganizationInput } from '@/domain/entities/Organization';
import { getSupabaseServerClient } from '../supabase/client';

export class OrganizationRepository implements IOrganizationRepository {
  private supabase = getSupabaseServerClient();

  async findById(id: string): Promise<Organization | null> {
    const { data, error } = await this.supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async findByCreator(creatorId: string): Promise<Organization[]> {
    const { data, error } = await this.supabase
      .from('organizations')
      .select('*')
      .eq('created_by', creatorId);

    if (error || !data) return [];
    return data.map(this.mapToEntity);
  }

  async create(input: CreateOrganizationInput): Promise<Organization> {
    const { data, error } = await this.supabase
      .from('organizations')
      .insert([input])
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create organization: ${error?.message}`);
    }

    return this.mapToEntity(data);
  }

  async update(id: string, input: UpdateOrganizationInput): Promise<Organization> {
    const { data, error } = await this.supabase
      .from('organizations')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update organization: ${error?.message}`);
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('organizations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete organization: ${error.message}`);
    }
  }

  async list(limit: number = 100, offset: number = 0): Promise<Organization[]> {
    const { data, error } = await this.supabase
      .from('organizations')
      .select('*')
      .range(offset, offset + limit - 1);

    if (error || !data) return [];
    return data.map(this.mapToEntity);
  }

  private mapToEntity(data: any): Organization {
    return {
      id: data.id,
      name: data.name,
      created_by: data.created_by,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    };
  }
}

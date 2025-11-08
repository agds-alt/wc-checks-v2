// Building Repository Implementation
import { IBuildingRepository } from '@/domain/repositories/IBuildingRepository';
import { Building, CreateBuildingInput, UpdateBuildingInput } from '@/domain/entities/Building';
import { getSupabaseServerClient } from '../supabase/client';

export class BuildingRepository implements IBuildingRepository {
  private supabase = getSupabaseServerClient();

  async findById(id: string): Promise<Building | null> {
    const { data, error } = await this.supabase
      .from('buildings')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async findByOrganization(organizationId: string): Promise<Building[]> {
    const { data, error } = await this.supabase
      .from('buildings')
      .select('*')
      .eq('organization_id', organizationId);

    if (error || !data) return [];
    return data.map(this.mapToEntity);
  }

  async create(input: CreateBuildingInput): Promise<Building> {
    const { data, error } = await this.supabase
      .from('buildings')
      .insert([input])
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create building: ${error?.message}`);
    }

    return this.mapToEntity(data);
  }

  async update(id: string, input: UpdateBuildingInput): Promise<Building> {
    const { data, error } = await this.supabase
      .from('buildings')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update building: ${error?.message}`);
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('buildings')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete building: ${error.message}`);
    }
  }

  async list(limit: number = 100, offset: number = 0): Promise<Building[]> {
    const { data, error } = await this.supabase
      .from('buildings')
      .select('*')
      .range(offset, offset + limit - 1);

    if (error || !data) return [];
    return data.map(this.mapToEntity);
  }

  private mapToEntity(data: any): Building {
    return {
      id: data.id,
      name: data.name,
      code: data.code,
      address: data.address,
      description: data.description,
      type: data.type,
      photo_url: data.photo_url,
      organization_id: data.organization_id,
      created_by: data.created_by,
      is_active: data.is_active,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    };
  }
}

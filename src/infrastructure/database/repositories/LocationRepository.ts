// Location Repository Implementation
import { ILocationRepository } from '@/domain/repositories/ILocationRepository';
import { Location, CreateLocationInput, UpdateLocationInput } from '@/domain/entities/Location';
import { getSupabaseServerClient } from '../supabase/client';

export class LocationRepository implements ILocationRepository {
  private supabase = getSupabaseServerClient();

  async findById(id: string): Promise<Location | null> {
    const { data, error } = await this.supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async findByQRCode(qrCode: string): Promise<Location | null> {
    const { data, error } = await this.supabase
      .from('locations')
      .select('*')
      .eq('qr_code', qrCode)
      .single();

    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async findByBuilding(buildingId: string): Promise<Location[]> {
    const { data, error } = await this.supabase
      .from('locations')
      .select('*')
      .eq('building_id', buildingId);

    if (error || !data) return [];
    return data.map(this.mapToEntity);
  }

  async create(input: CreateLocationInput): Promise<Location> {
    const { data, error } = await this.supabase
      .from('locations')
      .insert([input])
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create location: ${error?.message}`);
    }

    return this.mapToEntity(data);
  }

  async update(id: string, input: UpdateLocationInput): Promise<Location> {
    const { data, error } = await this.supabase
      .from('locations')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update location: ${error?.message}`);
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('locations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete location: ${error.message}`);
    }
  }

  async list(limit: number = 100, offset: number = 0): Promise<Location[]> {
    const { data, error } = await this.supabase
      .from('locations')
      .select('*')
      .range(offset, offset + limit - 1);

    if (error || !data) return [];
    return data.map(this.mapToEntity);
  }

  private mapToEntity(data: any): Location {
    return {
      id: data.id,
      code: data.code,
      name: data.name,
      description: data.description,
      floor: data.floor,
      section: data.section,
      area: data.area,
      coordinates: data.coordinates,
      qr_code: data.qr_code,
      photo_url: data.photo_url,
      building_id: data.building_id,
      organization_id: data.organization_id,
      is_active: data.is_active,
      created_by: data.created_by,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    };
  }
}

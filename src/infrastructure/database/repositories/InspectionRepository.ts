// Inspection Repository Implementation
import { IInspectionRepository, InspectionComponentRecord } from '@/domain/repositories/IInspectionRepository';
import { Inspection, CreateInspectionInput, UpdateInspectionInput } from '@/domain/entities/Inspection';
import { getSupabaseServerClient } from '../supabase/client';

export class InspectionRepository implements IInspectionRepository {
  private supabase = getSupabaseServerClient();

  async findById(id: string): Promise<Inspection | null> {
    const { data, error } = await this.supabase
      .from('inspections')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async findByLocation(locationId: string, limit: number = 50): Promise<Inspection[]> {
    const { data, error } = await this.supabase
      .from('inspections')
      .select('*')
      .eq('location_id', locationId)
      .order('inspection_date', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data.map(this.mapToEntity);
  }

  async findByInspector(inspectorId: string, limit: number = 50): Promise<Inspection[]> {
    const { data, error } = await this.supabase
      .from('inspections')
      .select('*')
      .eq('inspector_id', inspectorId)
      .order('inspection_date', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data.map(this.mapToEntity);
  }

  async findByDateRange(startDate: Date, endDate: Date, userId?: string): Promise<Inspection[]> {
    let query = this.supabase
      .from('inspections')
      .select('*')
      .gte('inspection_date', startDate.toISOString())
      .lte('inspection_date', endDate.toISOString());

    // Filter by userId if provided
    if (userId) {
      query = query.eq('inspector_id', userId);
    }

    const { data, error } = await query.order('inspection_date', { ascending: false });

    if (error || !data) return [];
    return data.map(this.mapToEntity);
  }

  async create(input: CreateInspectionInput): Promise<Inspection> {
    const { components, ...inspectionData } = input;

    // Insert inspection
    const { data: inspection, error: inspectionError } = await this.supabase
      .from('inspections')
      .insert([inspectionData])
      .select()
      .single();

    if (inspectionError || !inspection) {
      throw new Error(`Failed to create inspection: ${inspectionError?.message}`);
    }

    // Insert components
    if (components && components.length > 0) {
      const componentData = components.map(c => ({
        inspection_id: inspection.id,
        component_name: c.component_name,
        rating: c.rating,
        notes: c.notes,
      }));

      const { error: componentError } = await this.supabase
        .from('inspection_components')
        .insert(componentData);

      if (componentError) {
        // Rollback inspection if components fail
        await this.delete(inspection.id);
        throw new Error(`Failed to create inspection components: ${componentError.message}`);
      }
    }

    return this.mapToEntity(inspection);
  }

  async update(id: string, input: UpdateInspectionInput): Promise<Inspection> {
    const { data, error } = await this.supabase
      .from('inspections')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update inspection: ${error?.message}`);
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    // Delete components first (due to foreign key)
    await this.supabase
      .from('inspection_components')
      .delete()
      .eq('inspection_id', id);

    // Delete inspection
    const { error } = await this.supabase
      .from('inspections')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete inspection: ${error.message}`);
    }
  }

  async getComponents(inspectionId: string): Promise<InspectionComponentRecord[]> {
    const { data, error } = await this.supabase
      .from('inspection_components')
      .select('*')
      .eq('inspection_id', inspectionId);

    if (error || !data) return [];
    return data.map(this.mapComponentToEntity);
  }

  async list(limit: number = 1000, offset: number = 0): Promise<Inspection[]> {
    const { data, error } = await this.supabase
      .from('inspections')
      .select('*')
      .order('inspection_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error || !data) return [];
    return data.map(this.mapToEntity);
  }

  private mapToEntity(data: any): Inspection {
    return {
      id: data.id,
      location_id: data.location_id,
      inspector_id: data.inspector_id,
      inspection_date: data.inspection_date,
      inspection_time: data.inspection_time,
      template_id: data.template_id,
      inspection_data: data.inspection_data,
      overall_rating: data.overall_rating,
      duration_minutes: data.duration_minutes,
      status: data.status,
      notes: data.notes,
      created_at: data.created_at ? new Date(data.created_at) : null,
      updated_at: data.updated_at ? new Date(data.updated_at) : null,
    };
  }

  private mapComponentToEntity(data: any): InspectionComponentRecord {
    return {
      id: data.id,
      inspection_id: data.inspection_id,
      component_name: data.component_name,
      rating: data.rating,
      notes: data.notes,
      created_at: data.created_at,
    };
  }
}

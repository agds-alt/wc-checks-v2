// Template Repository Implementation
import { InspectionTemplate, CreateInspectionTemplateInput, UpdateInspectionTemplateInput } from '@/domain/entities/InspectionTemplate';
import { getSupabaseServerClient } from '../supabase/client';

export class TemplateRepository {
  private supabase = getSupabaseServerClient();

  async findById(id: string): Promise<InspectionTemplate | null> {
    const { data, error } = await this.supabase
      .from('inspection_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async findDefault(): Promise<InspectionTemplate | null> {
    const { data, error } = await this.supabase
      .from('inspection_templates')
      .select('*')
      .eq('is_default', true)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async list(limit: number = 100, offset: number = 0): Promise<InspectionTemplate[]> {
    const { data, error } = await this.supabase
      .from('inspection_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error || !data) return [];
    return data.map(this.mapToEntity);
  }

  async create(input: CreateInspectionTemplateInput): Promise<InspectionTemplate> {
    const { data, error } = await this.supabase
      .from('inspection_templates')
      .insert([input])
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create template: ${error?.message}`);
    }

    return this.mapToEntity(data);
  }

  async update(id: string, input: UpdateInspectionTemplateInput): Promise<InspectionTemplate> {
    const { data, error } = await this.supabase
      .from('inspection_templates')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update template: ${error?.message}`);
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('inspection_templates')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete template: ${error.message}`);
    }
  }

  private mapToEntity(data: any): InspectionTemplate {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      config: data.config,
      version: data.version,
      is_default: data.is_default,
      is_active: data.is_active,
      created_by: data.created_by,
      created_at: data.created_at ? new Date(data.created_at) : null,
      updated_at: data.updated_at ? new Date(data.updated_at) : null,
    };
  }
}

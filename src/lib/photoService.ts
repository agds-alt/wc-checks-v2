// Fix for photoService.ts uploaded_by field
// Error di line 41: 'uploaded_by' does not exist

// src/lib/photoService.ts (FIXED VERSION)

import { supabase } from './supabase';
import { TablesInsert } from '../types/database.types';
import { uploadToCloudinary } from './cloudinary';

export interface PhotoUploadData {
  file: File;
  caption?: string;
  field_reference?: string;
  inspection_id?: string;
  location_id?: string;
}

export const uploadPhoto = async (
  photoData: PhotoUploadData,
  userId: string
): Promise<string> => {
  try {
    // Upload to Cloudinary first
    const fileUrl = await uploadToCloudinary(photoData.file);

    // Create photo record in database dengan TablesInsert type
    const photoRecord = {
      file_url: fileUrl,
      file_name: photoData.file.name,
      file_size: photoData.file.size,
      mime_type: photoData.file.type,
      caption: photoData.caption ?? null,
      field_reference: photoData.field_reference ?? null,
      inspection_id: photoData.inspection_id ?? null,
      location_id: photoData.location_id ?? null,
      uploaded_by: userId,
      uploaded_at: new Date().toISOString(),
      is_deleted: false,
    } as unknown as TablesInsert<'photos'>;

    const { data, error } = await supabase
      .from('photos')
      .insert(photoRecord as any)
      .select()
      .single();

    if (error || !data) throw error || new Error('Failed to upload photo');

    return data.id;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
};

export const deletePhoto = async (photoId: string, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('photos')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: userId,
      } as any)
      .filter('id', 'eq', photoId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
};

export const getPhotosByInspection = async (inspectionId: string) => {
  try {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .filter('inspection_id', 'eq', inspectionId)
      .filter('is_deleted', 'eq', false)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching photos:', error);
    throw error;
  }
};

export const getPhotosByLocation = async (locationId: string) => {
  try {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .filter('location_id', 'eq', locationId)
      .filter('is_deleted', 'eq', false)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching location photos:', error);
    throw error;
  }
};
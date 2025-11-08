// Type fix for locationService.ts coordinates issue
// Error di line 175: coordinates type mismatch

// src/lib/locationService.ts (FIXED VERSION)

import { supabase } from './supabase';
import { TablesInsert, Json } from '../types/database.types';
import { LocationFormData, LocationCoordinates } from '../types/location.types';
import QRCode from 'qrcode';

export const createLocation = async (
  locationData: LocationFormData,
  createdBy: string
): Promise<string> => {
  try {
    // Generate QR code
    const locationId = crypto.randomUUID();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const qrDataUrl = `${baseUrl}/locations/${locationId}`;
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrDataUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    // Prepare insert data dengan type casting untuk coordinates
    const insertData: TablesInsert<'locations'> = {
      id: locationId,
      name: locationData.name,
      code: locationData.code || '',
      organization_id: locationData.organization_id,
      building_id: locationData.building_id,
      floor: locationData.floor || null,
      section: locationData.section || null,
      area: locationData.area || null,
      description: locationData.description || null,
      coordinates: locationData.coordinates as Json, // Type cast ke Json
      photo_url: locationData.photo_url || null,
      qr_code: qrCodeDataUrl,
      created_by: createdBy,
      is_active: true,
    };

    const { data, error } = await supabase
      .from('locations')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    
    return data.id;
  } catch (error) {
    console.error('Error creating location:', error);
    throw error;
  }
};

export const updateLocation = async (
  locationId: string,
  locationData: Partial<LocationFormData>
): Promise<void> => {
  try {
    const updateData: Partial<TablesInsert<'locations'>> = {
      name: locationData.name,
      code: locationData.code,
      organization_id: locationData.organization_id,
      building_id: locationData.building_id,
      floor: locationData.floor,
      section: locationData.section,
      area: locationData.area,
      description: locationData.description,
      coordinates: locationData.coordinates as Json, // Type cast
      photo_url: locationData.photo_url,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('locations')
      .update(updateData)
      .eq('id', locationId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating location:', error);
    throw error;
  }
};

export const deleteLocation = async (locationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', locationId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting location:', error);
    throw error;
  }
};

export const getLocationById = async (locationId: string) => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', locationId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching location:', error);
    throw error;
  }
};

export const validateLocationData = (data: LocationFormData): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim() === '') {
    errors.name = 'Nama lokasi harus diisi';
  } else if (data.name.length > 100) {
    errors.name = 'Nama lokasi maksimal 100 karakter';
  }

  if (!data.organization_id) {
    errors.organization_id = 'Organisasi harus dipilih';
  }

  if (!data.building_id) {
    errors.building_id = 'Gedung harus dipilih';
  }

  if (data.code && data.code.length > 50) {
    errors.code = 'Kode lokasi maksimal 50 karakter';
  }

  if (data.coordinates) {
    if (typeof data.coordinates.latitude !== 'number' || typeof data.coordinates.longitude !== 'number') {
      errors.coordinates = 'Koordinat tidak valid';
    } else if (data.coordinates.latitude < -90 || data.coordinates.latitude > 90) {
      errors.coordinates = 'Latitude harus antara -90 dan 90';
    } else if (data.coordinates.longitude < -180 || data.coordinates.longitude > 180) {
      errors.coordinates = 'Longitude harus antara -180 dan 180';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
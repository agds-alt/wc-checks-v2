/**
 * Location Service Unit Tests
 * Tests for location service functions
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  createLocation,
  updateLocation,
  deleteLocation,
  getLocationById,
  validateLocationData,
} from '../locationService';
import type { LocationFormData } from '../../types/location.types';

// Mock dependencies
const mockSupabase = {
  from: jest.fn(),
};

jest.mock('../supabase', () => ({
  supabase: mockSupabase,
}));

jest.mock('qrcode', () => ({
  __esModule: true,
  default: {
    toDataURL: jest.fn(),
  },
}));

jest.mock('../utils/typeConverters', () => ({
  coordinatesToJson: jest.fn((coords) => coords ? JSON.stringify(coords) : null),
}));

import QRCode from 'qrcode';

describe('locationService', () => {
  let mockSupabaseChain: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock chain for Supabase
    mockSupabaseChain = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      filter: jest.fn().mockReturnThis(),
    };

    mockSupabase.from.mockReturnValue(mockSupabaseChain);

    // Mock QRCode.toDataURL
    (QRCode.toDataURL as jest.Mock).mockResolvedValue('data:image/png;base64,mockQRCode');

    // Mock crypto.randomUUID
    global.crypto = {
      randomUUID: jest.fn(() => 'test-uuid-123'),
    } as any;

    // Mock environment variable
    process.env.NEXT_PUBLIC_APP_URL = 'https://test.com';
  });

  describe('createLocation', () => {
    const validLocationData: LocationFormData = {
      name: 'Test Location',
      code: 'LOC-001',
      organization_id: 'org-123',
      building_id: 'bld-123',
      floor: '3',
      section: 'A',
      area: 'Main Hall',
      description: 'Test description',
      coordinates: { latitude: -6.2088, longitude: 106.8456 },
      photo_url: 'https://example.com/photo.jpg',
    };

    it('should create location successfully with all fields', async () => {
      const createdLocation = {
        id: 'test-uuid-123',
        ...validLocationData,
        qr_code: 'data:image/png;base64,mockQRCode',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockSupabaseChain.single.mockResolvedValue({
        data: createdLocation,
        error: null,
      });

      const result = await createLocation(validLocationData, 'user-123');

      expect(result).toBe('test-uuid-123');
      expect(mockSupabase.from).toHaveBeenCalledWith('locations');
      expect(mockSupabaseChain.insert).toHaveBeenCalled();
      expect(mockSupabaseChain.select).toHaveBeenCalled();
      expect(mockSupabaseChain.single).toHaveBeenCalled();
    });

    it('should generate QR code with correct URL', async () => {
      mockSupabaseChain.single.mockResolvedValue({
        data: { id: 'test-uuid-123' },
        error: null,
      });

      await createLocation(validLocationData, 'user-123');

      expect(QRCode.toDataURL).toHaveBeenCalledWith(
        'https://test.com/locations/test-uuid-123',
        expect.objectContaining({
          width: 400,
          margin: 2,
        })
      );
    });

    it('should create location with minimal required fields', async () => {
      const minimalData: LocationFormData = {
        name: 'Minimal Location',
        organization_id: 'org-123',
        building_id: 'bld-123',
      };

      mockSupabaseChain.single.mockResolvedValue({
        data: { id: 'test-uuid-123' },
        error: null,
      });

      const result = await createLocation(minimalData, 'user-123');

      expect(result).toBe('test-uuid-123');
      expect(mockSupabaseChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Minimal Location',
          organization_id: 'org-123',
          building_id: 'bld-123',
          code: '',
          floor: null,
          section: null,
          area: null,
          description: null,
          photo_url: null,
        })
      );
    });

    it('should throw error when database insert fails', async () => {
      mockSupabaseChain.single.mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      });

      await expect(
        createLocation(validLocationData, 'user-123')
      ).rejects.toThrow('Database error');
    });

    it('should throw error when QR code generation fails', async () => {
      (QRCode.toDataURL as jest.Mock).mockRejectedValue(
        new Error('QR generation failed')
      );

      await expect(
        createLocation(validLocationData, 'user-123')
      ).rejects.toThrow('QR generation failed');
    });

    it('should use window.location.origin when env var not set', async () => {
      delete process.env.NEXT_PUBLIC_APP_URL;
      (global as any).window = { location: { origin: 'https://fallback.com' } };

      mockSupabaseChain.single.mockResolvedValue({
        data: { id: 'test-uuid-123' },
        error: null,
      });

      await createLocation(validLocationData, 'user-123');

      expect(QRCode.toDataURL).toHaveBeenCalledWith(
        'https://fallback.com/locations/test-uuid-123',
        expect.any(Object)
      );

      delete (global as any).window;
      process.env.NEXT_PUBLIC_APP_URL = 'https://test.com';
    });

    it('should handle null coordinates', async () => {
      const dataWithoutCoords: LocationFormData = {
        ...validLocationData,
        coordinates: undefined,
      };

      mockSupabaseChain.single.mockResolvedValue({
        data: { id: 'test-uuid-123' },
        error: null,
      });

      const result = await createLocation(dataWithoutCoords, 'user-123');

      expect(result).toBe('test-uuid-123');
    });

    it('should set is_active to true by default', async () => {
      mockSupabaseChain.single.mockResolvedValue({
        data: { id: 'test-uuid-123' },
        error: null,
      });

      await createLocation(validLocationData, 'user-123');

      expect(mockSupabaseChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          is_active: true,
        })
      );
    });
  });

  describe('updateLocation', () => {
    const locationId = 'loc-123';

    it('should update location with all fields', async () => {
      const updateData: Partial<LocationFormData> = {
        name: 'Updated Location',
        code: 'LOC-999',
        floor: '5',
        description: 'Updated description',
      };

      mockSupabaseChain.filter.mockResolvedValue({
        data: null,
        error: null,
      });

      await updateLocation(locationId, updateData);

      expect(mockSupabase.from).toHaveBeenCalledWith('locations');
      expect(mockSupabaseChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Location',
          code: 'LOC-999',
          floor: '5',
          description: 'Updated description',
          updated_at: expect.any(String),
        })
      );
      expect(mockSupabaseChain.filter).toHaveBeenCalledWith('id', 'eq', locationId);
    });

    it('should update only specified fields', async () => {
      const partialUpdate: Partial<LocationFormData> = {
        name: 'New Name Only',
      };

      mockSupabaseChain.filter.mockResolvedValue({
        data: null,
        error: null,
      });

      await updateLocation(locationId, partialUpdate);

      expect(mockSupabaseChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Name Only',
          updated_at: expect.any(String),
        })
      );
    });

    it('should update coordinates', async () => {
      const updateData: Partial<LocationFormData> = {
        coordinates: { latitude: -6.1234, longitude: 106.5678 },
      };

      mockSupabaseChain.filter.mockResolvedValue({
        data: null,
        error: null,
      });

      await updateLocation(locationId, updateData);

      expect(mockSupabaseChain.update).toHaveBeenCalled();
    });

    it('should throw error when update fails', async () => {
      mockSupabaseChain.filter.mockResolvedValue({
        data: null,
        error: new Error('Update failed'),
      });

      await expect(
        updateLocation(locationId, { name: 'Test' })
      ).rejects.toThrow('Update failed');
    });

    it('should handle empty update data', async () => {
      mockSupabaseChain.filter.mockResolvedValue({
        data: null,
        error: null,
      });

      await updateLocation(locationId, {});

      expect(mockSupabaseChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          updated_at: expect.any(String),
        })
      );
    });
  });

  describe('deleteLocation', () => {
    it('should delete location successfully', async () => {
      mockSupabaseChain.filter.mockResolvedValue({
        data: null,
        error: null,
      });

      await deleteLocation('loc-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('locations');
      expect(mockSupabaseChain.delete).toHaveBeenCalled();
      expect(mockSupabaseChain.filter).toHaveBeenCalledWith('id', 'eq', 'loc-123');
    });

    it('should throw error when deletion fails', async () => {
      mockSupabaseChain.filter.mockResolvedValue({
        data: null,
        error: new Error('Delete failed'),
      });

      await expect(deleteLocation('loc-123')).rejects.toThrow('Delete failed');
    });

    it('should handle foreign key constraint errors', async () => {
      mockSupabaseChain.filter.mockResolvedValue({
        data: null,
        error: { code: '23503', message: 'Foreign key violation' },
      });

      await expect(deleteLocation('loc-123')).rejects.toThrow();
    });
  });

  describe('getLocationById', () => {
    const mockLocation = {
      id: 'loc-123',
      name: 'Test Location',
      code: 'LOC-001',
      organization_id: 'org-123',
      building_id: 'bld-123',
      floor: '3',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should fetch location by id successfully', async () => {
      mockSupabaseChain.single.mockResolvedValue({
        data: mockLocation,
        error: null,
      });

      const result = await getLocationById('loc-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('locations');
      expect(mockSupabaseChain.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseChain.filter).toHaveBeenCalledWith('id', 'eq', 'loc-123');
      expect(mockSupabaseChain.single).toHaveBeenCalled();
      expect(result).toEqual(mockLocation);
    });

    it('should throw error when location not found', async () => {
      mockSupabaseChain.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      await expect(getLocationById('non-existent')).rejects.toThrow();
    });

    it('should throw error on database failure', async () => {
      mockSupabaseChain.single.mockResolvedValue({
        data: null,
        error: new Error('Database connection failed'),
      });

      await expect(getLocationById('loc-123')).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('validateLocationData', () => {
    const validData: LocationFormData = {
      name: 'Valid Location',
      code: 'LOC-001',
      organization_id: 'org-123',
      building_id: 'bld-123',
      floor: '3',
      coordinates: { latitude: -6.2088, longitude: 106.8456 },
    };

    it('should return valid for correct data', () => {
      const result = validateLocationData(validData);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should validate name is required', () => {
      const invalidData: LocationFormData = {
        ...validData,
        name: '',
      };

      const result = validateLocationData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors.name).toBe('Nama lokasi harus diisi');
    });

    it('should validate name is not just whitespace', () => {
      const invalidData: LocationFormData = {
        ...validData,
        name: '   ',
      };

      const result = validateLocationData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors.name).toBe('Nama lokasi harus diisi');
    });

    it('should validate name max length (100 characters)', () => {
      const invalidData: LocationFormData = {
        ...validData,
        name: 'a'.repeat(101),
      };

      const result = validateLocationData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors.name).toBe('Nama lokasi maksimal 100 karakter');
    });

    it('should validate organization_id is required', () => {
      const invalidData: LocationFormData = {
        ...validData,
        organization_id: '',
      };

      const result = validateLocationData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors.organization_id).toBe('Organisasi harus dipilih');
    });

    it('should validate building_id is required', () => {
      const invalidData: LocationFormData = {
        ...validData,
        building_id: '',
      };

      const result = validateLocationData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors.building_id).toBe('Gedung harus dipilih');
    });

    it('should validate code max length (50 characters)', () => {
      const invalidData: LocationFormData = {
        ...validData,
        code: 'a'.repeat(51),
      };

      const result = validateLocationData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors.code).toBe('Kode lokasi maksimal 50 karakter');
    });

    it('should allow optional code', () => {
      const dataWithoutCode: LocationFormData = {
        ...validData,
        code: undefined,
      };

      const result = validateLocationData(dataWithoutCode);

      expect(result.valid).toBe(true);
    });

    it('should validate latitude type', () => {
      const invalidData: LocationFormData = {
        ...validData,
        coordinates: { latitude: 'invalid' as any, longitude: 106.8456 },
      };

      const result = validateLocationData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors.coordinates).toBe('Koordinat tidak valid');
    });

    it('should validate longitude type', () => {
      const invalidData: LocationFormData = {
        ...validData,
        coordinates: { latitude: -6.2088, longitude: 'invalid' as any },
      };

      const result = validateLocationData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors.coordinates).toBe('Koordinat tidak valid');
    });

    it('should validate latitude range (-90 to 90)', () => {
      const invalidLatHigh: LocationFormData = {
        ...validData,
        coordinates: { latitude: 91, longitude: 106.8456 },
      };

      let result = validateLocationData(invalidLatHigh);
      expect(result.valid).toBe(false);
      expect(result.errors.coordinates).toBe('Latitude harus antara -90 dan 90');

      const invalidLatLow: LocationFormData = {
        ...validData,
        coordinates: { latitude: -91, longitude: 106.8456 },
      };

      result = validateLocationData(invalidLatLow);
      expect(result.valid).toBe(false);
      expect(result.errors.coordinates).toBe('Latitude harus antara -90 dan 90');
    });

    it('should validate longitude range (-180 to 180)', () => {
      const invalidLonHigh: LocationFormData = {
        ...validData,
        coordinates: { latitude: -6.2088, longitude: 181 },
      };

      let result = validateLocationData(invalidLonHigh);
      expect(result.valid).toBe(false);
      expect(result.errors.coordinates).toBe('Longitude harus antara -180 dan 180');

      const invalidLonLow: LocationFormData = {
        ...validData,
        coordinates: { latitude: -6.2088, longitude: -181 },
      };

      result = validateLocationData(invalidLonLow);
      expect(result.valid).toBe(false);
      expect(result.errors.coordinates).toBe('Longitude harus antara -180 dan 180');
    });

    it('should accept edge case latitude values (±90)', () => {
      const dataWithMinLat: LocationFormData = {
        ...validData,
        coordinates: { latitude: -90, longitude: 106.8456 },
      };

      let result = validateLocationData(dataWithMinLat);
      expect(result.valid).toBe(true);

      const dataWithMaxLat: LocationFormData = {
        ...validData,
        coordinates: { latitude: 90, longitude: 106.8456 },
      };

      result = validateLocationData(dataWithMaxLat);
      expect(result.valid).toBe(true);
    });

    it('should accept edge case longitude values (±180)', () => {
      const dataWithMinLon: LocationFormData = {
        ...validData,
        coordinates: { latitude: -6.2088, longitude: -180 },
      };

      let result = validateLocationData(dataWithMinLon);
      expect(result.valid).toBe(true);

      const dataWithMaxLon: LocationFormData = {
        ...validData,
        coordinates: { latitude: -6.2088, longitude: 180 },
      };

      result = validateLocationData(dataWithMaxLon);
      expect(result.valid).toBe(true);
    });

    it('should allow optional coordinates', () => {
      const dataWithoutCoords: LocationFormData = {
        ...validData,
        coordinates: undefined,
      };

      const result = validateLocationData(dataWithoutCoords);

      expect(result.valid).toBe(true);
    });

    it('should return multiple errors when multiple validations fail', () => {
      const invalidData: LocationFormData = {
        name: '',
        organization_id: '',
        building_id: '',
        code: 'a'.repeat(51),
        coordinates: { latitude: 100, longitude: 200 },
      };

      const result = validateLocationData(invalidData);

      expect(result.valid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(1);
      expect(result.errors.name).toBeDefined();
      expect(result.errors.organization_id).toBeDefined();
      expect(result.errors.building_id).toBeDefined();
      expect(result.errors.code).toBeDefined();
      expect(result.errors.coordinates).toBeDefined();
    });

    it('should handle zero coordinates', () => {
      const dataWithZeroCoords: LocationFormData = {
        ...validData,
        coordinates: { latitude: 0, longitude: 0 },
      };

      const result = validateLocationData(dataWithZeroCoords);

      expect(result.valid).toBe(true);
    });

    it('should allow optional fields to be undefined', () => {
      const minimalData: LocationFormData = {
        name: 'Minimal Location',
        organization_id: 'org-123',
        building_id: 'bld-123',
      };

      const result = validateLocationData(minimalData);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });
  });
});

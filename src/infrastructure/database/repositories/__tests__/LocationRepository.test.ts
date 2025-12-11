/**
 * LocationRepository Unit Tests
 * Tests for location repository with Supabase integration
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { LocationRepository } from '../LocationRepository';
import {
  createMockSupabaseClient,
  mockSupabaseSuccess,
  mockSupabaseError,
  mockSupabaseNotFound,
} from '@/__tests__/utils/test-helpers';
import { mockLocations, mockLocationsByBuilding } from '@/__tests__/fixtures/locations';

// Mock Supabase client
jest.mock('@/infrastructure/database/supabase/client', () => ({
  getSupabaseServerClient: jest.fn(),
}));

describe('LocationRepository', () => {
  let locationRepo: LocationRepository;
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create fresh mock Supabase client
    mockSupabase = createMockSupabaseClient();

    // Create repository instance with mocked Supabase
    locationRepo = new LocationRepository();
    // @ts-expect-error - Mocking private supabase client
    locationRepo.supabase = mockSupabase;
  });

  describe('findById', () => {
    it('should return location when found', async () => {
      const expectedLocation = mockLocations.floor1Toilet;

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(expectedLocation)
      );

      const result = await locationRepo.findById(expectedLocation.id);

      expect(mockSupabase.from).toHaveBeenCalledWith('locations');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', expectedLocation.id);
      expect(mockSupabase.single).toHaveBeenCalled();
      expect(result).toEqual(expectedLocation);
    });

    it('should return null when location not found', async () => {
      mockSupabase.single.mockResolvedValue(mockSupabaseNotFound());

      const result = await locationRepo.findById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should return null on database error', async () => {
      mockSupabase.single.mockResolvedValue(
        mockSupabaseError('Database error')
      );

      const result = await locationRepo.findById('loc-123');

      expect(result).toBeNull();
    });

    it('should preserve coordinates data', async () => {
      const location = mockLocations.floor1Toilet;

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(location)
      );

      const result = await locationRepo.findById(location.id);

      expect(result?.coordinates).toEqual(location.coordinates);
    });
  });

  describe('findByQRCode', () => {
    it('should return location when QR code found', async () => {
      const expectedLocation = mockLocations.floor1Toilet;

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(expectedLocation)
      );

      const result = await locationRepo.findByQRCode(expectedLocation.qr_code!);

      expect(mockSupabase.from).toHaveBeenCalledWith('locations');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('qr_code', expectedLocation.qr_code);
      expect(mockSupabase.single).toHaveBeenCalled();
      expect(result).toEqual(expectedLocation);
    });

    it('should return null when QR code not found', async () => {
      mockSupabase.single.mockResolvedValue(mockSupabaseNotFound());

      const result = await locationRepo.findByQRCode('QR-NOT-EXIST');

      expect(result).toBeNull();
    });

    it('should be case-sensitive for QR code lookup', async () => {
      mockSupabase.single.mockResolvedValue(mockSupabaseNotFound());

      const result = await locationRepo.findByQRCode('qr-f1-m-01'); // lowercase

      expect(mockSupabase.eq).toHaveBeenCalledWith('qr_code', 'qr-f1-m-01');
      expect(result).toBeNull();
    });

    it('should handle special characters in QR code', async () => {
      const specialQR = 'QR-SPECIAL-@#$-01';

      mockSupabase.single.mockResolvedValue(mockSupabaseNotFound());

      const result = await locationRepo.findByQRCode(specialQR);

      expect(mockSupabase.eq).toHaveBeenCalledWith('qr_code', specialQR);
      expect(result).toBeNull();
    });
  });

  describe('findByBuilding', () => {
    it('should return locations for building', async () => {
      const buildingId = 'bld-main-office-1';
      const expectedLocations = mockLocationsByBuilding[buildingId];

      mockSupabase.eq.mockResolvedValue(
        mockSupabaseSuccess(expectedLocations)
      );

      const result = await locationRepo.findByBuilding(buildingId);

      expect(mockSupabase.from).toHaveBeenCalledWith('locations');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('building_id', buildingId);
      expect(result).toHaveLength(expectedLocations.length);
      expect(result).toEqual(expectedLocations);
    });

    it('should return empty array when no locations found', async () => {
      mockSupabase.eq.mockResolvedValue(mockSupabaseSuccess([]));

      const result = await locationRepo.findByBuilding('bld-empty');

      expect(result).toEqual([]);
    });

    it('should return empty array on database error', async () => {
      mockSupabase.eq.mockResolvedValue(
        mockSupabaseError('Connection error')
      );

      const result = await locationRepo.findByBuilding('bld-123');

      expect(result).toEqual([]);
    });

    it('should handle null data response', async () => {
      mockSupabase.eq.mockResolvedValue(
        mockSupabaseSuccess(null)
      );

      const result = await locationRepo.findByBuilding('bld-123');

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create location successfully', async () => {
      const newLocation = {
        code: 'LOC-NEW',
        qr_code: 'QR-NEW-01',
        name: 'New Location',
        floor: '1',
        building_id: 'bld-main-office-1',
        organization_id: 'org-test-1',
        created_by: 'user-admin-2',
      };

      const createdLocation = {
        id: 'new-loc-123',
        ...newLocation,
        description: null,
        section: null,
        area: null,
        coordinates: null,
        photo_url: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(createdLocation)
      );

      const result = await locationRepo.create(newLocation);

      expect(mockSupabase.insert).toHaveBeenCalled();
      expect(result).toMatchObject({
        code: newLocation.code,
        qr_code: newLocation.qr_code,
        name: newLocation.name,
        floor: newLocation.floor,
      });
    });

    it('should create location with all optional fields', async () => {
      const fullLocation = {
        code: 'LOC-FULL',
        qr_code: 'QR-FULL-01',
        name: 'Full Location',
        description: 'Complete location data',
        floor: '5',
        section: 'North Wing',
        area: 'Executive Area',
        coordinates: { lat: -6.2088, lng: 106.8456 },
        photo_url: 'https://example.com/photo.jpg',
        building_id: 'bld-main-office-1',
        organization_id: 'org-test-1',
        created_by: 'user-admin-2',
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess({ ...fullLocation, id: 'full-loc-123', created_at: new Date(), updated_at: new Date() })
      );

      const result = await locationRepo.create(fullLocation);

      expect(result).toMatchObject(fullLocation);
      expect(result.coordinates).toEqual(fullLocation.coordinates);
    });

    it('should throw error on duplicate QR code', async () => {
      const duplicateLocation = {
        code: 'LOC-DUP',
        qr_code: mockLocations.floor1Toilet.qr_code, // Duplicate
        name: 'Duplicate Location',
        floor: '1',
        building_id: 'bld-main-office-1',
        organization_id: 'org-test-1',
        created_by: 'user-admin-2',
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseError('duplicate key value violates unique constraint', '23505')
      );

      await expect(locationRepo.create(duplicateLocation)).rejects.toThrow();
    });

    it('should throw error when creation fails', async () => {
      const newLocation = {
        code: 'LOC-ERR',
        qr_code: 'QR-ERR-01',
        name: 'Error Location',
        floor: '1',
        building_id: 'bld-main-office-1',
        organization_id: 'org-test-1',
        created_by: 'user-admin-2',
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseError('Failed to insert')
      );

      await expect(locationRepo.create(newLocation)).rejects.toThrow('Failed to create location');
    });

    it('should handle coordinates correctly', async () => {
      const locationWithCoords = {
        code: 'LOC-COORD',
        qr_code: 'QR-COORD-01',
        name: 'Location with Coordinates',
        floor: '1',
        coordinates: { lat: -6.2088, lng: 106.8456 },
        building_id: 'bld-main-office-1',
        organization_id: 'org-test-1',
        created_by: 'user-admin-2',
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess({ ...locationWithCoords, id: 'coord-loc-123', created_at: new Date(), updated_at: new Date() })
      );

      const result = await locationRepo.create(locationWithCoords);

      expect(result.coordinates).toEqual(locationWithCoords.coordinates);
    });
  });

  describe('update', () => {
    it('should update location successfully', async () => {
      const locationId = mockLocations.floor1Toilet.id;
      const updates = {
        name: 'Updated Location Name',
        description: 'Updated description',
      };

      const updatedLocation = {
        ...mockLocations.floor1Toilet,
        ...updates,
        updated_at: new Date(),
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(updatedLocation)
      );

      const result = await locationRepo.update(locationId, updates);

      expect(mockSupabase.update).toHaveBeenCalledWith(updates);
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', locationId);
      expect(result).toMatchObject(updates);
    });

    it('should allow partial updates', async () => {
      const locationId = mockLocations.floor1Toilet.id;
      const updates = { name: 'Only Name Updated' };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess({ ...mockLocations.floor1Toilet, ...updates })
      );

      const result = await locationRepo.update(locationId, updates);

      expect(result.name).toBe(updates.name);
      expect(result.floor).toBe(mockLocations.floor1Toilet.floor);
    });

    it('should update coordinates', async () => {
      const locationId = mockLocations.floor1Toilet.id;
      const newCoordinates = { lat: -6.2090, lng: 106.8460 };
      const updates = { coordinates: newCoordinates };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess({ ...mockLocations.floor1Toilet, ...updates })
      );

      const result = await locationRepo.update(locationId, updates);

      expect(result.coordinates).toEqual(newCoordinates);
    });

    it('should throw error when updating non-existent location', async () => {
      mockSupabase.single.mockResolvedValue(mockSupabaseNotFound());

      await expect(
        locationRepo.update('non-existent-id', { name: 'Test' })
      ).rejects.toThrow('Failed to update location');
    });

    it('should allow setting fields to null', async () => {
      const locationId = mockLocations.floor1Toilet.id;
      const updates = {
        description: null,
        section: null,
        area: null,
        coordinates: null,
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess({ ...mockLocations.floor1Toilet, ...updates })
      );

      const result = await locationRepo.update(locationId, updates);

      expect(result.description).toBeNull();
      expect(result.section).toBeNull();
      expect(result.area).toBeNull();
      expect(result.coordinates).toBeNull();
    });

    it('should throw error on database failure', async () => {
      mockSupabase.single.mockResolvedValue(
        mockSupabaseError('Connection lost')
      );

      await expect(
        locationRepo.update('loc-123', { name: 'Test' })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete location successfully', async () => {
      const locationId = mockLocations.inactiveLocation.id;

      mockSupabase.eq.mockResolvedValue(
        mockSupabaseSuccess(null)
      );

      await locationRepo.delete(locationId);

      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', locationId);
    });

    it('should throw error when deleting non-existent location', async () => {
      mockSupabase.eq.mockResolvedValue(
        mockSupabaseError('No rows affected', 'PGRST116')
      );

      await expect(locationRepo.delete('non-existent-id')).rejects.toThrow('Failed to delete location');
    });

    it('should throw error on foreign key constraint violation', async () => {
      const locationId = mockLocations.floor1Toilet.id;

      mockSupabase.eq.mockResolvedValue(
        mockSupabaseError('Foreign key constraint violation', '23503')
      );

      await expect(locationRepo.delete(locationId)).rejects.toThrow();
    });

    it('should handle deletion of location with associated inspections', async () => {
      const locationId = mockLocations.floor1Toilet.id;

      mockSupabase.eq.mockResolvedValue(
        mockSupabaseError('Cannot delete location with associated inspections', '23503')
      );

      await expect(locationRepo.delete(locationId)).rejects.toThrow();
    });
  });

  describe('list', () => {
    it('should return paginated locations', async () => {
      const mockLocationList = [
        mockLocations.floor1Toilet,
        mockLocations.floor1Ladies,
      ];

      (mockSupabase as any).range =
        // @ts-ignore - Mocking range method
        jest.fn().mockResolvedValue(mockSupabaseSuccess(mockLocationList));

      const result = await locationRepo.list(10, 0);

      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.range).toHaveBeenCalledWith(0, 9);
      expect(result).toHaveLength(2);
      expect(result).toEqual(mockLocationList);
    });

    it('should handle empty results', async () => {
      (mockSupabase as any).range =
        // @ts-ignore - Mocking range method
        jest.fn().mockResolvedValue(mockSupabaseSuccess([]));

      const result = await locationRepo.list(10, 0);

      expect(result).toEqual([]);
    });

    it('should respect limit parameter', async () => {
      const limit = 5;

      (mockSupabase as any).range =
        // @ts-ignore - Mocking range method
        jest.fn().mockResolvedValue(mockSupabaseSuccess([]));

      await locationRepo.list(limit, 0);

      expect(mockSupabase.range).toHaveBeenCalledWith(0, limit - 1);
    });

    it('should handle offset correctly', async () => {
      const offset = 20;
      const limit = 10;

      (mockSupabase as any).range =
        // @ts-ignore - Mocking range method
        jest.fn().mockResolvedValue(mockSupabaseSuccess([]));

      await locationRepo.list(limit, offset);

      expect(mockSupabase.range).toHaveBeenCalledWith(offset, offset + limit - 1);
    });

    it('should use default limit when not provided', async () => {
      (mockSupabase as any).range =
        // @ts-ignore - Mocking range method
        jest.fn().mockResolvedValue(mockSupabaseSuccess([]));

      await locationRepo.list();

      expect(mockSupabase.range).toHaveBeenCalledWith(0, 99);
    });

    it('should handle database error gracefully', async () => {
      (mockSupabase as any).range =
        // @ts-ignore - Mocking range method
        jest.fn().mockResolvedValue(mockSupabaseError('Connection error'));

      const result = await locationRepo.list(10, 0);

      expect(result).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null coordinates', async () => {
      const locationWithNullCoords = {
        ...mockLocations.inactiveLocation,
        coordinates: null,
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(locationWithNullCoords)
      );

      const result = await locationRepo.findById(locationWithNullCoords.id);

      expect(result?.coordinates).toBeNull();
    });

    it('should handle basement floor notation', async () => {
      const location = mockLocations.basementToilet;

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(location)
      );

      const result = await locationRepo.findById(location.id);

      expect(result?.floor).toBe('B1');
    });

    it('should handle very long location names', async () => {
      const longName = 'A'.repeat(500);

      const locationWithLongName = {
        ...mockLocations.newLocation,
        name: longName,
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(locationWithLongName)
      );

      const result = await locationRepo.findById('loc-long');

      expect(result?.name).toBe(longName);
    });

    it('should handle special characters in location data', async () => {
      const specialLocation = {
        id: 'special-loc-123',
        code: 'LOC-O\'Brien',
        qr_code: 'QR-SPECIAL-@#$',
        name: 'Location & Co. (Ltd.)',
        floor: '1/2',
        building_id: 'bld-main-office-1',
        organization_id: 'org-test-1',
        is_active: true,
        created_by: 'user-admin-2',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(specialLocation)
      );

      const result = await locationRepo.findById('special-loc-123');

      expect(result?.name).toBe(specialLocation.name);
      expect(result?.qr_code).toBe(specialLocation.qr_code);
    });

    it('should handle empty QR code string', async () => {
      mockSupabase.single.mockResolvedValue(mockSupabaseNotFound());

      const result = await locationRepo.findByQRCode('');

      expect(mockSupabase.eq).toHaveBeenCalledWith('qr_code', '');
      expect(result).toBeNull();
    });
  });

  describe('Data Integrity', () => {
    it('should preserve date types', async () => {
      const location = mockLocations.floor1Toilet;

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(location)
      );

      const result = await locationRepo.findById(location.id);

      expect(result?.created_at).toBeInstanceOf(Date);
      expect(result?.updated_at).toBeInstanceOf(Date);
    });

    it('should preserve all location fields', async () => {
      const location = mockLocations.floor1Toilet;

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(location)
      );

      const result = await locationRepo.findById(location.id);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('code');
      expect(result).toHaveProperty('qr_code');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('floor');
      expect(result).toHaveProperty('coordinates');
      expect(result).toHaveProperty('building_id');
      expect(result).toHaveProperty('organization_id');
      expect(result).toHaveProperty('created_by');
      expect(result).toHaveProperty('is_active');
      expect(result).toHaveProperty('created_at');
      expect(result).toHaveProperty('updated_at');
    });

    it('should not mutate input data on create', async () => {
      const input = {
        code: 'LOC-TEST',
        qr_code: 'QR-TEST-01',
        name: 'Test Location',
        floor: '1',
        building_id: 'bld-main-office-1',
        organization_id: 'org-test-1',
        created_by: 'user-admin-2',
      };

      const inputCopy = { ...input };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess({ ...input, id: 'new-loc-123', created_at: new Date(), updated_at: new Date() })
      );

      await locationRepo.create(input);

      expect(input).toEqual(inputCopy);
    });

    it('should preserve coordinates object structure', async () => {
      const coordinates = { lat: -6.2088, lng: 106.8456 };
      const location = {
        ...mockLocations.floor1Toilet,
        coordinates,
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(location)
      );

      const result = await locationRepo.findById(location.id);

      expect(result?.coordinates).toHaveProperty('lat');
      expect(result?.coordinates).toHaveProperty('lng');
      expect(typeof result?.coordinates?.lat).toBe('number');
      expect(typeof result?.coordinates?.lng).toBe('number');
    });
  });
});

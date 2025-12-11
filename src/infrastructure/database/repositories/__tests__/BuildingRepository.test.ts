/**
 * BuildingRepository Unit Tests
 * Tests for building repository with Supabase integration
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { BuildingRepository } from '../BuildingRepository';
import {
  createMockSupabaseClient,
  mockSupabaseSuccess,
  mockSupabaseError,
  mockSupabaseNotFound,
} from '@/__tests__/utils/test-helpers';
import { mockBuildings } from '@/__tests__/fixtures/buildings';

// Mock Supabase client
jest.mock('@/infrastructure/database/supabase/client', () => ({
  getSupabaseServerClient: jest.fn(),
}));

describe('BuildingRepository', () => {
  let buildingRepo: BuildingRepository;
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create fresh mock Supabase client
    mockSupabase = createMockSupabaseClient();

    // Create repository instance with mocked Supabase
    buildingRepo = new BuildingRepository();
    // @ts-expect-error - Mocking private supabase client
    buildingRepo.supabase = mockSupabase;
  });

  describe('findById', () => {
    it('should return building when found', async () => {
      const expectedBuilding = mockBuildings.mainOffice;

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(expectedBuilding)
      );

      const result = await buildingRepo.findById(expectedBuilding.id);

      expect(mockSupabase.from).toHaveBeenCalledWith('buildings');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', expectedBuilding.id);
      expect(mockSupabase.single).toHaveBeenCalled();
      expect(result).toEqual(expectedBuilding);
    });

    it('should return null when building not found', async () => {
      mockSupabase.single.mockResolvedValue(mockSupabaseNotFound());

      const result = await buildingRepo.findById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should return null on database error', async () => {
      const errorMessage = 'Database connection failed';
      mockSupabase.single.mockResolvedValue(
        mockSupabaseError(errorMessage)
      );

      const result = await buildingRepo.findById('building-123');

      expect(result).toBeNull();
    });

    it('should handle special characters in building ID', async () => {
      const buildingId = 'bld-special-123!@#';

      mockSupabase.single.mockResolvedValue(mockSupabaseNotFound());

      const result = await buildingRepo.findById(buildingId);

      expect(mockSupabase.eq).toHaveBeenCalledWith('id', buildingId);
      expect(result).toBeNull();
    });
  });

  describe('findByOrganization', () => {
    it('should return buildings for organization', async () => {
      const orgId = 'org-test-1';
      const expectedBuildings = [
        mockBuildings.mainOffice,
        mockBuildings.warehouse,
        mockBuildings.shoppingMall,
      ];

      mockSupabase.eq.mockResolvedValue(
        mockSupabaseSuccess(expectedBuildings)
      );

      const result = await buildingRepo.findByOrganization(orgId);

      expect(mockSupabase.from).toHaveBeenCalledWith('buildings');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('organization_id', orgId);
      expect(result).toHaveLength(3);
      expect(result).toEqual(expectedBuildings);
    });

    it('should return empty array when no buildings found', async () => {
      mockSupabase.eq.mockResolvedValue(mockSupabaseSuccess([]));

      const result = await buildingRepo.findByOrganization('org-empty');

      expect(result).toEqual([]);
    });

    it('should return empty array on database error', async () => {
      mockSupabase.eq.mockResolvedValue(
        mockSupabaseError('Connection timeout')
      );

      const result = await buildingRepo.findByOrganization('org-123');

      expect(result).toEqual([]);
    });

    it('should handle null data response', async () => {
      mockSupabase.eq.mockResolvedValue(
        mockSupabaseSuccess(null)
      );

      const result = await buildingRepo.findByOrganization('org-123');

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create building successfully', async () => {
      const newBuilding = {
        code: 'BLD-NEW',
        name: 'New Building',
        address: 'Test Address',
        organization_id: 'org-test-1',
        created_by: 'user-admin-2',
      };

      const createdBuilding = {
        id: 'new-bld-123',
        ...newBuilding,
        description: null,
        type: null,
        photo_url: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(createdBuilding)
      );

      const result = await buildingRepo.create(newBuilding);

      expect(mockSupabase.insert).toHaveBeenCalled();
      expect(result).toMatchObject({
        code: newBuilding.code,
        name: newBuilding.name,
        address: newBuilding.address,
      });
    });

    it('should create building with all optional fields', async () => {
      const fullBuilding = {
        code: 'BLD-FULL',
        name: 'Full Building',
        address: 'Full Address',
        description: 'Complete building data',
        type: 'office',
        photo_url: 'https://example.com/photo.jpg',
        organization_id: 'org-test-1',
        created_by: 'user-admin-2',
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess({ ...fullBuilding, id: 'full-bld-123', created_at: new Date(), updated_at: new Date() })
      );

      const result = await buildingRepo.create(fullBuilding);

      expect(result).toMatchObject(fullBuilding);
    });

    it('should throw error on duplicate code', async () => {
      const duplicateBuilding = {
        code: mockBuildings.mainOffice.code,
        name: 'Duplicate Building',
        address: 'Test Address',
        organization_id: 'org-test-1',
        created_by: 'user-admin-2',
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseError('duplicate key value violates unique constraint', '23505')
      );

      await expect(buildingRepo.create(duplicateBuilding)).rejects.toThrow();
    });

    it('should throw error when creation fails', async () => {
      const newBuilding = {
        code: 'BLD-ERR',
        name: 'Error Building',
        address: 'Test Address',
        organization_id: 'org-test-1',
        created_by: 'user-admin-2',
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseError('Failed to insert')
      );

      await expect(buildingRepo.create(newBuilding)).rejects.toThrow('Failed to create building');
    });
  });

  describe('update', () => {
    it('should update building successfully', async () => {
      const buildingId = mockBuildings.mainOffice.id;
      const updates = {
        name: 'Updated Building Name',
        description: 'Updated description',
      };

      const updatedBuilding = {
        ...mockBuildings.mainOffice,
        ...updates,
        updated_at: new Date(),
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(updatedBuilding)
      );

      const result = await buildingRepo.update(buildingId, updates);

      expect(mockSupabase.update).toHaveBeenCalledWith(updates);
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', buildingId);
      expect(result).toMatchObject(updates);
    });

    it('should allow partial updates', async () => {
      const buildingId = mockBuildings.warehouse.id;
      const updates = { name: 'Only Name Updated' };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess({ ...mockBuildings.warehouse, ...updates })
      );

      const result = await buildingRepo.update(buildingId, updates);

      expect(result.name).toBe(updates.name);
      expect(result.address).toBe(mockBuildings.warehouse.address);
    });

    it('should throw error when updating non-existent building', async () => {
      mockSupabase.single.mockResolvedValue(mockSupabaseNotFound());

      await expect(
        buildingRepo.update('non-existent-id', { name: 'Test' })
      ).rejects.toThrow('Failed to update building');
    });

    it('should allow setting fields to null', async () => {
      const buildingId = mockBuildings.mainOffice.id;
      const updates = {
        description: null,
        photo_url: null,
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess({ ...mockBuildings.mainOffice, ...updates })
      );

      const result = await buildingRepo.update(buildingId, updates);

      expect(result.description).toBeNull();
      expect(result.photo_url).toBeNull();
    });

    it('should throw error on database failure', async () => {
      mockSupabase.single.mockResolvedValue(
        mockSupabaseError('Connection lost')
      );

      await expect(
        buildingRepo.update('bld-123', { name: 'Test' })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete building successfully', async () => {
      const buildingId = mockBuildings.inactiveBuilding.id;

      mockSupabase.eq.mockResolvedValue(
        mockSupabaseSuccess(null)
      );

      await buildingRepo.delete(buildingId);

      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', buildingId);
    });

    it('should throw error when deleting non-existent building', async () => {
      mockSupabase.eq.mockResolvedValue(
        mockSupabaseError('No rows affected', 'PGRST116')
      );

      await expect(buildingRepo.delete('non-existent-id')).rejects.toThrow('Failed to delete building');
    });

    it('should throw error on foreign key constraint violation', async () => {
      const buildingId = mockBuildings.mainOffice.id;

      mockSupabase.eq.mockResolvedValue(
        mockSupabaseError('Foreign key constraint violation', '23503')
      );

      await expect(buildingRepo.delete(buildingId)).rejects.toThrow();
    });

    it('should handle deletion of building with associated locations', async () => {
      // This tests that the database cascade rules are working
      const buildingId = mockBuildings.mainOffice.id;

      mockSupabase.eq.mockResolvedValue(
        mockSupabaseError('Cannot delete building with associated locations', '23503')
      );

      await expect(buildingRepo.delete(buildingId)).rejects.toThrow();
    });
  });

  describe('list', () => {
    it('should return paginated buildings', async () => {
      const mockBuildingList = [
        mockBuildings.mainOffice,
        mockBuildings.warehouse,
      ];

      (mockSupabase as any).range =
        // @ts-ignore - Mocking range method
        jest.fn().mockResolvedValue(mockSupabaseSuccess(mockBuildingList));

      const result = await buildingRepo.list(10, 0);

      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.range).toHaveBeenCalledWith(0, 9);
      expect(result).toHaveLength(2);
      expect(result).toEqual(mockBuildingList);
    });

    it('should handle empty results', async () => {
      (mockSupabase as any).range =
        // @ts-ignore - Mocking range method
        jest.fn().mockResolvedValue(mockSupabaseSuccess([]));

      const result = await buildingRepo.list(10, 0);

      expect(result).toEqual([]);
    });

    it('should respect limit parameter', async () => {
      const limit = 5;

      (mockSupabase as any).range =
        // @ts-ignore - Mocking range method
        jest.fn().mockResolvedValue(mockSupabaseSuccess([]));

      await buildingRepo.list(limit, 0);

      expect(mockSupabase.range).toHaveBeenCalledWith(0, limit - 1);
    });

    it('should handle offset correctly', async () => {
      const offset = 20;
      const limit = 10;

      (mockSupabase as any).range =
        // @ts-ignore - Mocking range method
        jest.fn().mockResolvedValue(mockSupabaseSuccess([]));

      await buildingRepo.list(limit, offset);

      expect(mockSupabase.range).toHaveBeenCalledWith(offset, offset + limit - 1);
    });

    it('should use default limit when not provided', async () => {
      (mockSupabase as any).range =
        // @ts-ignore - Mocking range method
        jest.fn().mockResolvedValue(mockSupabaseSuccess([]));

      await buildingRepo.list();

      expect(mockSupabase.range).toHaveBeenCalledWith(0, 99);
    });

    it('should handle database error gracefully', async () => {
      (mockSupabase as any).range =
        // @ts-ignore - Mocking range method
        jest.fn().mockResolvedValue(mockSupabaseError('Connection error'));

      const result = await buildingRepo.list(10, 0);

      expect(result).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values gracefully', async () => {
      const buildingWithNulls = {
        ...mockBuildings.newBuilding,
        description: null,
        type: null,
        photo_url: null,
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(buildingWithNulls)
      );

      const result = await buildingRepo.findById(buildingWithNulls.id);

      expect(result).toEqual(buildingWithNulls);
    });

    it('should handle very long building names', async () => {
      const longName = 'A'.repeat(500);

      const buildingWithLongName = {
        ...mockBuildings.newBuilding,
        name: longName,
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(buildingWithLongName)
      );

      const result = await buildingRepo.findById('bld-long');

      expect(result?.name).toBe(longName);
    });

    it('should handle special characters in building data', async () => {
      const specialBuilding = {
        id: 'special-bld-123',
        code: 'BLD-O\'Brien',
        name: 'Building & Co. (Ltd.)',
        address: 'Jl. "Sudirman" No. 1-2/3',
        organization_id: 'org-test-1',
        created_by: 'user-admin-2',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(specialBuilding)
      );

      const result = await buildingRepo.findById('special-bld-123');

      expect(result?.name).toBe(specialBuilding.name);
      expect(result?.code).toBe(specialBuilding.code);
    });
  });

  describe('Data Integrity', () => {
    it('should preserve date types', async () => {
      const building = mockBuildings.mainOffice;

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(building)
      );

      const result = await buildingRepo.findById(building.id);

      expect(result?.created_at).toBeInstanceOf(Date);
      expect(result?.updated_at).toBeInstanceOf(Date);
    });

    it('should preserve all building fields', async () => {
      const building = mockBuildings.mainOffice;

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(building)
      );

      const result = await buildingRepo.findById(building.id);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('code');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('address');
      expect(result).toHaveProperty('organization_id');
      expect(result).toHaveProperty('created_by');
      expect(result).toHaveProperty('is_active');
      expect(result).toHaveProperty('created_at');
      expect(result).toHaveProperty('updated_at');
    });

    it('should not mutate input data on create', async () => {
      const input = {
        code: 'BLD-TEST',
        name: 'Test Building',
        address: 'Test Address',
        organization_id: 'org-test-1',
        created_by: 'user-admin-2',
      };

      const inputCopy = { ...input };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess({ ...input, id: 'new-bld-123', created_at: new Date(), updated_at: new Date() })
      );

      await buildingRepo.create(input);

      expect(input).toEqual(inputCopy);
    });
  });
});

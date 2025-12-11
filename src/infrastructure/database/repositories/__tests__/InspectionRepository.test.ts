/**
 * InspectionRepository Unit Tests
 * Tests for inspection repository with Supabase integration
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { InspectionRepository } from '../InspectionRepository';
import {
  createMockSupabaseClient,
  mockSupabaseSuccess,
  mockSupabaseError,
  mockSupabaseNotFound,
} from '@/__tests__/utils/test-helpers';
import { mockInspections } from '@/__tests__/fixtures/inspections';

// Mock Supabase client
jest.mock('@/infrastructure/database/supabase/client', () => ({
  getSupabaseServerClient: jest.fn(),
}));

describe('InspectionRepository', () => {
  let inspectionRepo: InspectionRepository;
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create fresh mock Supabase client
    mockSupabase = createMockSupabaseClient();

    // Create repository instance with mocked Supabase
    inspectionRepo = new InspectionRepository();
    // @ts-expect-error - Mocking private supabase client
    inspectionRepo.supabase = mockSupabase;
  });

  describe('findById', () => {
    it('should return inspection when found', async () => {
      const expectedInspection = mockInspections.excellent;

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(expectedInspection)
      );

      const result = await inspectionRepo.findById(expectedInspection.id);

      expect(mockSupabase.from).toHaveBeenCalledWith('inspections');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', expectedInspection.id);
      expect(mockSupabase.single).toHaveBeenCalled();
      expect(result).toEqual(expectedInspection);
    });

    it('should return null when inspection not found', async () => {
      mockSupabase.single.mockResolvedValue(mockSupabaseNotFound());

      const result = await inspectionRepo.findById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should return null on database error', async () => {
      mockSupabase.single.mockResolvedValue(
        mockSupabaseError('Database error')
      );

      const result = await inspectionRepo.findById('insp-123');

      expect(result).toBeNull();
    });

    it('should preserve inspection_data JSON', async () => {
      const inspection = mockInspections.excellent;

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(inspection)
      );

      const result = await inspectionRepo.findById(inspection.id);

      expect(result?.inspection_data).toEqual(inspection.inspection_data);
    });
  });

  describe('findByLocation', () => {
    it('should return inspections for location', async () => {
      const locationId = 'loc-test-1';
      const expectedInspections = [
        mockInspections.excellent,
        mockInspections.fair,
        mockInspections.withPhotos,
      ];

      (mockSupabase as any).limit =
        // @ts-ignore - Mocking limit method
        jest.fn().mockResolvedValue(mockSupabaseSuccess(expectedInspections));
      (mockSupabase as any).order =
        // @ts-ignore - Mocking order method
        jest.fn().mockReturnThis();

      const result = await inspectionRepo.findByLocation(locationId, 50);

      expect(mockSupabase.from).toHaveBeenCalledWith('inspections');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('location_id', locationId);
      expect(mockSupabase.order).toHaveBeenCalledWith('inspection_date', { ascending: false });
      expect(mockSupabase.limit).toHaveBeenCalledWith(50);
      expect(result).toHaveLength(expectedInspections.length);
    });

    it('should use default limit when not provided', async () => {
      (mockSupabase as any).limit =
        // @ts-ignore - Mocking limit method
        jest.fn().mockResolvedValue(mockSupabaseSuccess([]));
      (mockSupabase as any).order =
        // @ts-ignore - Mocking order method
        jest.fn().mockReturnThis();

      await inspectionRepo.findByLocation('loc-test-1');

      expect(mockSupabase.limit).toHaveBeenCalledWith(50);
    });

    it('should return empty array when no inspections found', async () => {
      (mockSupabase as any).limit =
        // @ts-ignore - Mocking limit method
        jest.fn().mockResolvedValue(mockSupabaseSuccess([]));
      (mockSupabase as any).order =
        // @ts-ignore - Mocking order method
        jest.fn().mockReturnThis();

      const result = await inspectionRepo.findByLocation('loc-empty');

      expect(result).toEqual([]);
    });

    it('should return empty array on database error', async () => {
      (mockSupabase as any).limit =
        // @ts-ignore - Mocking limit method
        jest.fn().mockResolvedValue(mockSupabaseError('Connection error'));
      (mockSupabase as any).order =
        // @ts-ignore - Mocking order method
        jest.fn().mockReturnThis();

      const result = await inspectionRepo.findByLocation('loc-123');

      expect(result).toEqual([]);
    });

    it('should order by date descending (newest first)', async () => {
      (mockSupabase as any).limit =
        // @ts-ignore - Mocking limit method
        jest.fn().mockResolvedValue(mockSupabaseSuccess([]));
      (mockSupabase as any).order =
        // @ts-ignore - Mocking order method
        jest.fn().mockReturnThis();

      await inspectionRepo.findByLocation('loc-test-1');

      expect(mockSupabase.order).toHaveBeenCalledWith('inspection_date', { ascending: false });
    });
  });

  describe('findByInspector', () => {
    it('should return inspections by inspector', async () => {
      const inspectorId = 'user-inspector-4';
      const expectedInspections = [
        mockInspections.excellent,
        mockInspections.good,
      ];

      (mockSupabase as any).limit =
        // @ts-ignore - Mocking limit method
        jest.fn().mockResolvedValue(mockSupabaseSuccess(expectedInspections));
      (mockSupabase as any).order =
        // @ts-ignore - Mocking order method
        jest.fn().mockReturnThis();

      const result = await inspectionRepo.findByInspector(inspectorId, 50);

      expect(mockSupabase.eq).toHaveBeenCalledWith('inspector_id', inspectorId);
      expect(mockSupabase.order).toHaveBeenCalledWith('inspection_date', { ascending: false });
      expect(result).toHaveLength(expectedInspections.length);
    });

    it('should use default limit when not provided', async () => {
      (mockSupabase as any).limit =
        // @ts-ignore - Mocking limit method
        jest.fn().mockResolvedValue(mockSupabaseSuccess([]));
      (mockSupabase as any).order =
        // @ts-ignore - Mocking order method
        jest.fn().mockReturnThis();

      await inspectionRepo.findByInspector('user-inspector-4');

      expect(mockSupabase.limit).toHaveBeenCalledWith(50);
    });

    it('should return empty array when no inspections found', async () => {
      (mockSupabase as any).limit =
        // @ts-ignore - Mocking limit method
        jest.fn().mockResolvedValue(mockSupabaseSuccess([]));
      (mockSupabase as any).order =
        // @ts-ignore - Mocking order method
        jest.fn().mockReturnThis();

      const result = await inspectionRepo.findByInspector('user-no-inspections');

      expect(result).toEqual([]);
    });

    it('should return empty array on database error', async () => {
      (mockSupabase as any).limit =
        // @ts-ignore - Mocking limit method
        jest.fn().mockResolvedValue(mockSupabaseError('Connection error'));
      (mockSupabase as any).order =
        // @ts-ignore - Mocking order method
        jest.fn().mockReturnThis();

      const result = await inspectionRepo.findByInspector('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('findByDateRange', () => {
    it('should return inspections within date range', async () => {
      const startDate = new Date('2024-01-14');
      const endDate = new Date('2024-01-15');
      const expectedInspections = [
        mockInspections.excellent,
        mockInspections.good,
        mockInspections.fair,
      ];

      (mockSupabase as any).order =
        // @ts-ignore - Mocking order method
        jest.fn().mockResolvedValue(mockSupabaseSuccess(expectedInspections));
      (mockSupabase as any).gte =
        // @ts-ignore - Mocking gte method
        jest.fn().mockReturnThis();
      (mockSupabase as any).lte =
        // @ts-ignore - Mocking lte method
        jest.fn().mockReturnThis();

      const result = await inspectionRepo.findByDateRange(startDate, endDate);

      expect(mockSupabase.gte).toHaveBeenCalledWith('inspection_date', startDate.toISOString());
      expect(mockSupabase.lte).toHaveBeenCalledWith('inspection_date', endDate.toISOString());
      expect(mockSupabase.order).toHaveBeenCalledWith('inspection_date', { ascending: false });
      expect(result).toHaveLength(expectedInspections.length);
    });

    it('should handle same start and end date (single day)', async () => {
      const singleDate = new Date('2024-01-15');

      (mockSupabase as any).order =
        // @ts-ignore - Mocking order method
        jest.fn().mockResolvedValue(mockSupabaseSuccess([]));
      (mockSupabase as any).gte =
        // @ts-ignore - Mocking gte method
        jest.fn().mockReturnThis();
      (mockSupabase as any).lte =
        // @ts-ignore - Mocking lte method
        jest.fn().mockReturnThis();

      await inspectionRepo.findByDateRange(singleDate, singleDate);

      expect(mockSupabase.gte).toHaveBeenCalledWith('inspection_date', singleDate.toISOString());
      expect(mockSupabase.lte).toHaveBeenCalledWith('inspection_date', singleDate.toISOString());
    });

    it('should return empty array when no inspections in range', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      (mockSupabase as any).order =
        // @ts-ignore - Mocking order method
        jest.fn().mockResolvedValue(mockSupabaseSuccess([]));
      (mockSupabase as any).gte =
        // @ts-ignore - Mocking gte method
        jest.fn().mockReturnThis();
      (mockSupabase as any).lte =
        // @ts-ignore - Mocking lte method
        jest.fn().mockReturnThis();

      const result = await inspectionRepo.findByDateRange(startDate, endDate);

      expect(result).toEqual([]);
    });

    it('should return empty array on database error', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      (mockSupabase as any).order =
        // @ts-ignore - Mocking order method
        jest.fn().mockResolvedValue(mockSupabaseError('Connection error'));
      (mockSupabase as any).gte =
        // @ts-ignore - Mocking gte method
        jest.fn().mockReturnThis();
      (mockSupabase as any).lte =
        // @ts-ignore - Mocking lte method
        jest.fn().mockReturnThis();

      const result = await inspectionRepo.findByDateRange(startDate, endDate);

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create inspection without components successfully', async () => {
      const newInspection = {
        location_id: 'loc-test-1',
        inspector_id: 'user-inspector-4',
        inspection_date: '2024-01-15',
        inspection_data: {},
        overall_rating: 4,
      };

      const createdInspection = {
        id: 'new-insp-123',
        ...newInspection,
        inspection_time: null,
        template_id: null,
        duration_minutes: null,
        status: 'draft',
        notes: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(createdInspection)
      );

      const result = await inspectionRepo.create(newInspection);

      expect(mockSupabase.insert).toHaveBeenCalled();
      expect(result).toMatchObject({
        location_id: newInspection.location_id,
        inspector_id: newInspection.inspector_id,
        overall_rating: newInspection.overall_rating,
      });
    });

    it('should create inspection with components successfully', async () => {
      const newInspection = {
        location_id: 'loc-test-1',
        inspector_id: 'user-inspector-4',
        inspection_date: '2024-01-15',
        inspection_data: {},
        overall_rating: 4,
        components: [
          { component_name: 'cleanliness', rating: 4, notes: 'Spotless' },
          { component_name: 'odor', rating: 4, notes: 'Fresh' },
        ],
      };

      const createdInspection = {
        id: 'new-insp-with-comp-123',
        location_id: newInspection.location_id,
        inspector_id: newInspection.inspector_id,
        inspection_date: newInspection.inspection_date,
        inspection_data: newInspection.inspection_data,
        overall_rating: newInspection.overall_rating,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Mock inspection creation - single() is the final method in the chain
      mockSupabase.single.mockResolvedValueOnce(
        mockSupabaseSuccess(createdInspection)
      );

      // Mock component creation - components don't use .single(), they just use .insert()
      // So we need to mock insert to return a resolved promise for the second call
      mockSupabase.insert
        .mockReturnValueOnce(mockSupabase as any) // First call (inspection) returns this for chaining
        .mockResolvedValueOnce(mockSupabaseSuccess(null)); // Second call (components) returns promise

      const result = await inspectionRepo.create(newInspection);

      expect(mockSupabase.insert).toHaveBeenCalledTimes(2); // Once for inspection, once for components
      expect(result.id).toBe(createdInspection.id);
    });

    it('should rollback inspection if component creation fails', async () => {
      const newInspection = {
        location_id: 'loc-test-1',
        inspector_id: 'user-inspector-4',
        inspection_date: '2024-01-15',
        inspection_data: {},
        overall_rating: 4,
        components: [
          { component_name: 'cleanliness', rating: 4, notes: 'Spotless' },
        ],
      };

      const createdInspection = {
        id: 'rollback-insp-123',
        ...newInspection,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Mock inspection creation success - single() is the final method
      mockSupabase.single.mockResolvedValueOnce(
        mockSupabaseSuccess(createdInspection)
      );

      // Mock component creation failure
      mockSupabase.insert
        .mockReturnValueOnce(mockSupabase as any) // First call (inspection) returns this for chaining
        .mockResolvedValueOnce(mockSupabaseError('Component insert failed')); // Second call (components) fails

      // Mock deletion (rollback)
      mockSupabase.eq.mockResolvedValueOnce(
        mockSupabaseSuccess(null)
      );

      await expect(inspectionRepo.create(newInspection)).rejects.toThrow('Failed to create inspection components');

      // Verify rollback was attempted
      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('inspection_id', createdInspection.id);
    });

    it('should throw error when inspection creation fails', async () => {
      const newInspection = {
        location_id: 'loc-test-1',
        inspector_id: 'user-inspector-4',
        inspection_date: '2024-01-15',
        inspection_data: {},
        overall_rating: 4,
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseError('Failed to insert')
      );

      await expect(inspectionRepo.create(newInspection)).rejects.toThrow('Failed to create inspection');
    });

    it('should handle empty components array', async () => {
      const newInspection = {
        location_id: 'loc-test-1',
        inspector_id: 'user-inspector-4',
        inspection_date: '2024-01-15',
        inspection_data: {},
        overall_rating: 4,
        components: [],
      };

      const createdInspection = {
        id: 'empty-comp-insp-123',
        ...newInspection,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(createdInspection)
      );

      const result = await inspectionRepo.create(newInspection);

      // Should only insert inspection, not components
      expect(mockSupabase.insert).toHaveBeenCalledTimes(1);
      expect(result.id).toBe(createdInspection.id);
    });
  });

  describe('update', () => {
    it('should update inspection successfully', async () => {
      const inspectionId = mockInspections.excellent.id;
      const updates = {
        overall_rating: 3,
        notes: 'Updated notes',
      };

      const updatedInspection = {
        ...mockInspections.excellent,
        ...updates,
        updated_at: new Date(),
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(updatedInspection)
      );

      const result = await inspectionRepo.update(inspectionId, updates);

      expect(mockSupabase.update).toHaveBeenCalledWith(updates);
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', inspectionId);
      expect(result).toMatchObject(updates);
    });

    it('should allow partial updates', async () => {
      const inspectionId = mockInspections.excellent.id;
      const updates = { overall_rating: 2 };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess({ ...mockInspections.excellent, ...updates })
      );

      const result = await inspectionRepo.update(inspectionId, updates);

      expect(result.overall_rating).toBe(updates.overall_rating);
      expect(result.location_id).toBe(mockInspections.excellent.location_id);
    });

    it('should update inspection_data JSON', async () => {
      const inspectionId = mockInspections.excellent.id;
      const newData = { cleanliness: 3, odor: 2 };
      const updates = { inspection_data: newData };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess({ ...mockInspections.excellent, inspection_data: newData })
      );

      const result = await inspectionRepo.update(inspectionId, updates);

      expect(result.inspection_data).toEqual(newData);
    });

    it('should throw error when updating non-existent inspection', async () => {
      mockSupabase.single.mockResolvedValue(mockSupabaseNotFound());

      await expect(
        inspectionRepo.update('non-existent-id', { overall_rating: 3 })
      ).rejects.toThrow('Failed to update inspection');
    });

    it('should throw error on database failure', async () => {
      mockSupabase.single.mockResolvedValue(
        mockSupabaseError('Connection lost')
      );

      await expect(
        inspectionRepo.update('insp-123', { overall_rating: 3 })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete inspection and its components successfully', async () => {
      const inspectionId = mockInspections.excellent.id;

      // Mock component deletion
      mockSupabase.eq.mockResolvedValueOnce(
        mockSupabaseSuccess(null)
      );

      // Mock inspection deletion
      mockSupabase.eq.mockResolvedValueOnce(
        mockSupabaseSuccess(null)
      );

      await inspectionRepo.delete(inspectionId);

      expect(mockSupabase.delete).toHaveBeenCalledTimes(2); // Components first, then inspection
      expect(mockSupabase.eq).toHaveBeenCalledWith('inspection_id', inspectionId);
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', inspectionId);
    });

    it('should delete components before inspection (correct order)', async () => {
      const inspectionId = mockInspections.excellent.id;
      const deleteCalls: string[] = [];

      mockSupabase.from.mockImplementation((table: string) => {
        deleteCalls.push(table);
        return mockSupabase;
      });

      mockSupabase.eq.mockResolvedValue(
        mockSupabaseSuccess(null)
      );

      await inspectionRepo.delete(inspectionId);

      expect(deleteCalls[0]).toBe('inspection_components'); // Components first
      expect(deleteCalls[1]).toBe('inspections'); // Then inspection
    });

    it('should throw error when deleting non-existent inspection', async () => {
      mockSupabase.eq.mockResolvedValueOnce(
        mockSupabaseSuccess(null) // Components deletion succeeds (or nothing to delete)
      );

      mockSupabase.eq.mockResolvedValueOnce(
        mockSupabaseError('No rows affected', 'PGRST116')
      );

      await expect(inspectionRepo.delete('non-existent-id')).rejects.toThrow('Failed to delete inspection');
    });

    it('should continue if no components exist', async () => {
      const inspectionId = mockInspections.excellent.id;

      // Mock no components to delete
      mockSupabase.eq.mockResolvedValueOnce(
        mockSupabaseSuccess(null)
      );

      // Mock inspection deletion success
      mockSupabase.eq.mockResolvedValueOnce(
        mockSupabaseSuccess(null)
      );

      await inspectionRepo.delete(inspectionId);

      expect(mockSupabase.delete).toHaveBeenCalledTimes(2);
    });
  });

  describe('getComponents', () => {
    it('should return components for inspection', async () => {
      const inspectionId = 'insp-with-comp-1';
      const expectedComponents = [
        { id: 'comp-1', inspection_id: inspectionId, component_name: 'cleanliness', rating: 4, notes: 'Spotless', created_at: new Date() },
        { id: 'comp-2', inspection_id: inspectionId, component_name: 'odor', rating: 4, notes: 'Fresh', created_at: new Date() },
      ];

      mockSupabase.eq.mockResolvedValue(
        mockSupabaseSuccess(expectedComponents)
      );

      const result = await inspectionRepo.getComponents(inspectionId);

      expect(mockSupabase.from).toHaveBeenCalledWith('inspection_components');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('inspection_id', inspectionId);
      expect(result).toHaveLength(expectedComponents.length);
      expect(result).toEqual(expectedComponents);
    });

    it('should return empty array when no components found', async () => {
      mockSupabase.eq.mockResolvedValue(mockSupabaseSuccess([]));

      const result = await inspectionRepo.getComponents('insp-no-comp');

      expect(result).toEqual([]);
    });

    it('should return empty array on database error', async () => {
      mockSupabase.eq.mockResolvedValue(
        mockSupabaseError('Connection error')
      );

      const result = await inspectionRepo.getComponents('insp-123');

      expect(result).toEqual([]);
    });

    it('should handle null data response', async () => {
      mockSupabase.eq.mockResolvedValue(
        mockSupabaseSuccess(null)
      );

      const result = await inspectionRepo.getComponents('insp-123');

      expect(result).toEqual([]);
    });
  });

  describe('list', () => {
    it('should return paginated inspections ordered by date', async () => {
      const mockInspectionList = [
        mockInspections.excellent,
        mockInspections.good,
      ];

      (mockSupabase as any).range =
        // @ts-ignore - Mocking range method
        jest.fn().mockResolvedValue(mockSupabaseSuccess(mockInspectionList));
      (mockSupabase as any).order =
        // @ts-ignore - Mocking order method
        jest.fn().mockReturnThis();

      const result = await inspectionRepo.list(10, 0);

      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.order).toHaveBeenCalledWith('inspection_date', { ascending: false });
      expect(mockSupabase.range).toHaveBeenCalledWith(0, 9);
      expect(result).toHaveLength(2);
    });

    it('should handle empty results', async () => {
      (mockSupabase as any).range =
        // @ts-ignore - Mocking range method
        jest.fn().mockResolvedValue(mockSupabaseSuccess([]));
      (mockSupabase as any).order =
        // @ts-ignore - Mocking order method
        jest.fn().mockReturnThis();

      const result = await inspectionRepo.list(10, 0);

      expect(result).toEqual([]);
    });

    it('should use default limit when not provided', async () => {
      (mockSupabase as any).range =
        // @ts-ignore - Mocking range method
        jest.fn().mockResolvedValue(mockSupabaseSuccess([]));
      (mockSupabase as any).order =
        // @ts-ignore - Mocking order method
        jest.fn().mockReturnThis();

      await inspectionRepo.list();

      expect(mockSupabase.range).toHaveBeenCalledWith(0, 99);
    });

    it('should handle database error gracefully', async () => {
      (mockSupabase as any).range =
        // @ts-ignore - Mocking range method
        jest.fn().mockResolvedValue(mockSupabaseError('Connection error'));
      (mockSupabase as any).order =
        // @ts-ignore - Mocking order method
        jest.fn().mockReturnThis();

      const result = await inspectionRepo.list(10, 0);

      expect(result).toEqual([]);
    });
  });

  describe('Data Integrity', () => {
    it('should preserve date types', async () => {
      const inspection = mockInspections.excellent;

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(inspection)
      );

      const result = await inspectionRepo.findById(inspection.id);

      expect(result?.created_at).toBeInstanceOf(Date);
      expect(result?.updated_at).toBeInstanceOf(Date);
    });

    it('should preserve inspection_data structure', async () => {
      const inspection = mockInspections.excellent;

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(inspection)
      );

      const result = await inspectionRepo.findById(inspection.id);

      expect(result?.inspection_data).toBeDefined();
      expect(typeof result?.inspection_data).toBe('object');
    });

    it('should preserve all inspection fields', async () => {
      const inspection = mockInspections.excellent;

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(inspection)
      );

      const result = await inspectionRepo.findById(inspection.id);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('location_id');
      expect(result).toHaveProperty('inspector_id');
      expect(result).toHaveProperty('inspection_date');
      expect(result).toHaveProperty('inspection_data');
      expect(result).toHaveProperty('overall_rating');
      expect(result).toHaveProperty('created_at');
      expect(result).toHaveProperty('updated_at');
    });
  });
});

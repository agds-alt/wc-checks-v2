import { describe, it, expect } from '@jest/globals';
import type {
  Inspection,
  CreateInspectionInput,
  UpdateInspectionInput,
  InspectionRating,
} from '../../entities/Inspection';
import { INSPECTION_RATINGS } from '../../entities/Inspection';

describe('Inspection Entity', () => {
  describe('Inspection interface', () => {
    it('should create a valid Inspection object', () => {
      const inspection: Inspection = {
        id: 'insp-123',
        location_id: 'loc-456',
        inspector_id: 'user-789',
        inspection_date: '2024-01-15',
        inspection_time: '14:30:00',
        template_id: 'tmpl-001',
        inspection_data: {
          cleanliness: 4,
          odor: 3,
          supplies: 4,
        },
        overall_rating: 4,
        duration_minutes: 15,
        status: 'completed',
        notes: 'Excellent condition',
        created_at: new Date('2024-01-15'),
        updated_at: new Date('2024-01-15'),
      };

      expect(inspection.id).toBe('insp-123');
      expect(inspection.location_id).toBe('loc-456');
      expect(inspection.inspector_id).toBe('user-789');
      expect(inspection.overall_rating).toBe(4);
    });

    it('should allow nullable fields', () => {
      const inspection: Inspection = {
        id: 'insp-123',
        location_id: 'loc-456',
        inspector_id: 'user-789',
        inspection_date: '2024-01-15',
        inspection_time: '14:30:00',
        template_id: null,
        inspection_data: {},
        overall_rating: null,
        duration_minutes: null,
        status: null,
        notes: null,
        created_at: null,
        updated_at: null,
      };

      expect(inspection.template_id).toBeNull();
      expect(inspection.overall_rating).toBeNull();
      expect(inspection.notes).toBeNull();
    });
  });

  describe('CreateInspectionInput interface', () => {
    it('should create inspection with required fields', () => {
      const input: CreateInspectionInput = {
        location_id: 'loc-123',
        inspector_id: 'user-456',
        inspection_data: {
          cleanliness: 4,
          supplies: 3,
        },
      };

      expect(input.location_id).toBe('loc-123');
      expect(input.inspector_id).toBe('user-456');
      expect(input.inspection_data).toBeDefined();
    });

    it('should create inspection with all optional fields', () => {
      const input: CreateInspectionInput = {
        location_id: 'loc-123',
        inspector_id: 'user-456',
        inspection_date: '2024-01-15',
        inspection_time: '10:30:00',
        template_id: 'tmpl-001',
        inspection_data: { cleanliness: 4 },
        overall_rating: 4,
        duration_minutes: 20,
        status: 'completed',
        notes: 'All good',
        components: [
          { name: 'toilet', rating: 4 },
          { name: 'sink', rating: 3 },
        ],
      };

      expect(input.inspection_date).toBe('2024-01-15');
      expect(input.components).toHaveLength(2);
    });
  });

  describe('UpdateInspectionInput interface', () => {
    it('should allow partial updates', () => {
      const update: UpdateInspectionInput = {
        overall_rating: 3,
      };

      expect(update.overall_rating).toBe(3);
      expect(update.notes).toBeUndefined();
    });

    it('should allow updating multiple fields', () => {
      const update: UpdateInspectionInput = {
        inspection_date: '2024-01-16',
        overall_rating: 4,
        status: 'completed',
        notes: 'Updated inspection',
      };

      expect(update.inspection_date).toBe('2024-01-16');
      expect(update.overall_rating).toBe(4);
      expect(update.status).toBe('completed');
    });
  });

  describe('INSPECTION_RATINGS constants', () => {
    it('should have correct rating values', () => {
      expect(INSPECTION_RATINGS.EXCELLENT).toBe(4);
      expect(INSPECTION_RATINGS.GOOD).toBe(3);
      expect(INSPECTION_RATINGS.FAIR).toBe(2);
      expect(INSPECTION_RATINGS.POOR).toBe(1);
    });

    it('should be assignable to InspectionRating type', () => {
      const excellent: InspectionRating = INSPECTION_RATINGS.EXCELLENT;
      const good: InspectionRating = INSPECTION_RATINGS.GOOD;
      const fair: InspectionRating = INSPECTION_RATINGS.FAIR;
      const poor: InspectionRating = INSPECTION_RATINGS.POOR;

      expect(excellent).toBe(4);
      expect(good).toBe(3);
      expect(fair).toBe(2);
      expect(poor).toBe(1);
    });
  });

  describe('Inspection data validation scenarios', () => {
    it('should handle complex inspection_data objects', () => {
      const inspection: Inspection = {
        id: 'insp-123',
        location_id: 'loc-456',
        inspector_id: 'user-789',
        inspection_date: '2024-01-15',
        inspection_time: '14:30:00',
        template_id: null,
        inspection_data: {
          cleanliness: 4,
          odor: 3,
          supplies: {
            soap: true,
            tissue: true,
            towel: false,
          },
          maintenance: {
            plumbing: 'good',
            lighting: 'excellent',
          },
        },
        overall_rating: 4,
        duration_minutes: 15,
        status: 'completed',
        notes: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      expect(inspection.inspection_data.cleanliness).toBe(4);
      expect(inspection.inspection_data.supplies.soap).toBe(true);
      expect(inspection.inspection_data.maintenance.plumbing).toBe('good');
    });

    it('should handle empty inspection_data', () => {
      const inspection: Inspection = {
        id: 'insp-123',
        location_id: 'loc-456',
        inspector_id: 'user-789',
        inspection_date: '2024-01-15',
        inspection_time: '14:30:00',
        template_id: null,
        inspection_data: {},
        overall_rating: null,
        duration_minutes: null,
        status: null,
        notes: null,
        created_at: null,
        updated_at: null,
      };

      expect(inspection.inspection_data).toEqual({});
    });
  });

  describe('Date and time handling', () => {
    it('should accept valid ISO date strings', () => {
      const dates = ['2024-01-01', '2024-12-31', '2023-06-15'];

      dates.forEach((date) => {
        const inspection: Inspection = {
          id: 'insp-123',
          location_id: 'loc-456',
          inspector_id: 'user-789',
          inspection_date: date,
          inspection_time: '10:00:00',
          template_id: null,
          inspection_data: {},
          overall_rating: null,
          duration_minutes: null,
          status: null,
          notes: null,
          created_at: null,
          updated_at: null,
        };

        expect(inspection.inspection_date).toBe(date);
      });
    });

    it('should accept valid time strings', () => {
      const times = ['00:00:00', '12:30:45', '23:59:59'];

      times.forEach((time) => {
        const inspection: Inspection = {
          id: 'insp-123',
          location_id: 'loc-456',
          inspector_id: 'user-789',
          inspection_date: '2024-01-01',
          inspection_time: time,
          template_id: null,
          inspection_data: {},
          overall_rating: null,
          duration_minutes: null,
          status: null,
          notes: null,
          created_at: null,
          updated_at: null,
        };

        expect(inspection.inspection_time).toBe(time);
      });
    });
  });
});

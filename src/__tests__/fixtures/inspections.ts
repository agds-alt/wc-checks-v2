/**
 * Inspection Test Fixtures
 */

import type { Inspection } from '@/domain/entities/Inspection';
import { INSPECTION_RATINGS } from '@/domain/entities/Inspection';

export const mockInspections = {
  excellent: {
    id: 'insp-excellent-1',
    location_id: 'loc-test-1',
    inspector_id: 'user-inspector-4',
    inspection_date: '2024-01-15',
    inspection_time: '14:30:00',
    template_id: 'tmpl-default-1',
    inspection_data: {
      cleanliness: 4,
      odor: 4,
      supplies: {
        soap: true,
        tissue: true,
        towel: true,
        handDryer: true,
      },
      functionality: {
        toilet: 'good',
        sink: 'excellent',
        lighting: 'excellent',
        ventilation: 'good',
      },
      maintenance: {
        walls: 4,
        floor: 4,
        fixtures: 4,
      },
    },
    overall_rating: INSPECTION_RATINGS.EXCELLENT,
    duration_minutes: 15,
    status: 'completed',
    notes: 'Excellent condition, all facilities working properly',
    created_at: new Date('2024-01-15T14:45:00Z'),
    updated_at: new Date('2024-01-15T14:45:00Z'),
  } as Inspection,

  good: {
    id: 'insp-good-2',
    location_id: 'loc-test-2',
    inspector_id: 'user-inspector-4',
    inspection_date: '2024-01-15',
    inspection_time: '10:15:00',
    template_id: 'tmpl-default-1',
    inspection_data: {
      cleanliness: 3,
      odor: 3,
      supplies: {
        soap: true,
        tissue: true,
        towel: false,
        handDryer: true,
      },
      functionality: {
        toilet: 'good',
        sink: 'good',
        lighting: 'good',
        ventilation: 'fair',
      },
    },
    overall_rating: INSPECTION_RATINGS.GOOD,
    duration_minutes: 12,
    status: 'completed',
    notes: 'Good condition, towel needs refill',
    created_at: new Date('2024-01-15T10:27:00Z'),
    updated_at: new Date('2024-01-15T10:27:00Z'),
  } as Inspection,

  fair: {
    id: 'insp-fair-3',
    location_id: 'loc-test-1',
    inspector_id: 'user-inspector-4',
    inspection_date: '2024-01-14',
    inspection_time: '16:00:00',
    template_id: 'tmpl-default-1',
    inspection_data: {
      cleanliness: 2,
      odor: 2,
      supplies: {
        soap: false,
        tissue: true,
        towel: false,
        handDryer: false,
      },
      functionality: {
        toilet: 'fair',
        sink: 'poor',
        lighting: 'fair',
        ventilation: 'poor',
      },
    },
    overall_rating: INSPECTION_RATINGS.FAIR,
    duration_minutes: 10,
    status: 'completed',
    notes: 'Needs cleaning and supply refill. Sink drains slowly.',
    created_at: new Date('2024-01-14T16:10:00Z'),
    updated_at: new Date('2024-01-14T16:10:00Z'),
  } as Inspection,

  poor: {
    id: 'insp-poor-4',
    location_id: 'loc-test-3',
    inspector_id: 'user-inspector-4',
    inspection_date: '2024-01-14',
    inspection_time: '09:00:00',
    template_id: 'tmpl-default-1',
    inspection_data: {
      cleanliness: 1,
      odor: 1,
      supplies: {
        soap: false,
        tissue: false,
        towel: false,
        handDryer: false,
      },
      functionality: {
        toilet: 'poor',
        sink: 'broken',
        lighting: 'poor',
        ventilation: 'broken',
      },
    },
    overall_rating: INSPECTION_RATINGS.POOR,
    duration_minutes: 20,
    status: 'completed',
    notes: 'URGENT: Requires immediate attention. Sink broken, ventilation not working.',
    created_at: new Date('2024-01-14T09:20:00Z'),
    updated_at: new Date('2024-01-14T09:20:00Z'),
  } as Inspection,

  withPhotos: {
    id: 'insp-with-photos-5',
    location_id: 'loc-test-1',
    inspector_id: 'user-inspector-4',
    inspection_date: '2024-01-13',
    inspection_time: '11:00:00',
    template_id: 'tmpl-default-1',
    inspection_data: {
      cleanliness: 3,
      odor: 3,
      photos: [
        {
          url: 'https://cloudinary.com/photo1.jpg',
          component: 'toilet',
          timestamp: '2024-01-13T11:05:00Z',
        },
        {
          url: 'https://cloudinary.com/photo2.jpg',
          component: 'sink',
          timestamp: '2024-01-13T11:06:00Z',
        },
      ],
    },
    overall_rating: INSPECTION_RATINGS.GOOD,
    duration_minutes: 18,
    status: 'completed',
    notes: 'Photos attached for documentation',
    created_at: new Date('2024-01-13T11:18:00Z'),
    updated_at: new Date('2024-01-13T11:18:00Z'),
  } as Inspection,

  draft: {
    id: 'insp-draft-6',
    location_id: 'loc-test-2',
    inspector_id: 'user-inspector-4',
    inspection_date: '2024-01-15',
    inspection_time: '15:00:00',
    template_id: 'tmpl-default-1',
    inspection_data: {
      cleanliness: 3,
      // Incomplete data
    },
    overall_rating: null,
    duration_minutes: null,
    status: 'draft',
    notes: null,
    created_at: new Date('2024-01-15T15:05:00Z'),
    updated_at: new Date('2024-01-15T15:05:00Z'),
  } as Inspection,
};

export const mockInspectionComponents = {
  excellentComponents: [
    { name: 'cleanliness', rating: 4, notes: 'Spotless' },
    { name: 'odor', rating: 4, notes: 'Fresh' },
    { name: 'supplies', rating: 4, notes: 'Fully stocked' },
    { name: 'functionality', rating: 4, notes: 'All working' },
  ],

  poorComponents: [
    { name: 'cleanliness', rating: 1, notes: 'Very dirty' },
    { name: 'odor', rating: 1, notes: 'Unpleasant smell' },
    { name: 'supplies', rating: 1, notes: 'Empty' },
    { name: 'functionality', rating: 1, notes: 'Multiple issues' },
  ],
};

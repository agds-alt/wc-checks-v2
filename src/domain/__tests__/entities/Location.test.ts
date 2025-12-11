import { describe, it, expect } from '@jest/globals';
import type { Location, CreateLocationInput, UpdateLocationInput } from '../../entities/Location';

describe('Location Entity', () => {
  describe('Location interface', () => {
    it('should create a valid Location object with all fields', () => {
      const location: Location = {
        id: 'loc-123',
        code: 'WC-A-001',
        name: 'Toilet Lantai 1 Area A',
        description: 'Main toilet on first floor',
        floor: '1',
        section: 'A',
        area: 'Main Building',
        coordinates: { lat: -6.2088, lng: 106.8456 },
        qr_code: 'QR-WC-A-001',
        photo_url: 'https://example.com/wc-a-001.jpg',
        building_id: 'bld-456',
        organization_id: 'org-789',
        is_active: true,
        created_by: 'user-001',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      expect(location.id).toBe('loc-123');
      expect(location.code).toBe('WC-A-001');
      expect(location.name).toBe('Toilet Lantai 1 Area A');
      expect(location.building_id).toBe('bld-456');
      expect(location.organization_id).toBe('org-789');
    });

    it('should allow nullable fields', () => {
      const location: Location = {
        id: 'loc-123',
        code: 'WC-B-001',
        name: 'Toilet Lantai 2',
        description: null,
        floor: null,
        section: null,
        area: null,
        coordinates: null,
        qr_code: null,
        photo_url: null,
        building_id: 'bld-456',
        organization_id: 'org-789',
        is_active: null,
        created_by: null,
        created_at: null,
        updated_at: null,
      };

      expect(location.description).toBeNull();
      expect(location.floor).toBeNull();
      expect(location.coordinates).toBeNull();
    });
  });

  describe('CreateLocationInput interface', () => {
    it('should create location with required fields only', () => {
      const input: CreateLocationInput = {
        code: 'WC-C-001',
        name: 'Toilet Lantai 3',
        building_id: 'bld-123',
        organization_id: 'org-456',
      };

      expect(input.code).toBe('WC-C-001');
      expect(input.name).toBe('Toilet Lantai 3');
      expect(input.building_id).toBe('bld-123');
      expect(input.organization_id).toBe('org-456');
    });

    it('should create location with all optional fields', () => {
      const input: CreateLocationInput = {
        code: 'WC-D-001',
        name: 'Toilet Lantai 4',
        description: 'Executive toilet',
        floor: '4',
        section: 'D',
        area: 'Executive Area',
        coordinates: { lat: -6.2088, lng: 106.8456 },
        qr_code: 'QR-WC-D-001',
        photo_url: 'https://example.com/photo.jpg',
        building_id: 'bld-789',
        organization_id: 'org-123',
        is_active: true,
        created_by: 'user-001',
      };

      expect(input.description).toBe('Executive toilet');
      expect(input.floor).toBe('4');
      expect(input.coordinates).toBeDefined();
      expect(input.qr_code).toBe('QR-WC-D-001');
    });
  });

  describe('UpdateLocationInput interface', () => {
    it('should allow partial updates', () => {
      const update: UpdateLocationInput = {
        name: 'Updated Toilet Name',
      };

      expect(update.name).toBe('Updated Toilet Name');
      expect(update.code).toBeUndefined();
    });

    it('should allow updating multiple fields', () => {
      const update: UpdateLocationInput = {
        code: 'WC-E-002',
        name: 'Toilet Updated',
        description: 'Updated description',
        is_active: false,
      };

      expect(update.code).toBe('WC-E-002');
      expect(update.name).toBe('Toilet Updated');
      expect(update.is_active).toBe(false);
    });

    it('should allow setting fields to null', () => {
      const update: UpdateLocationInput = {
        description: null,
        floor: null,
        section: null,
      };

      expect(update.description).toBeNull();
      expect(update.floor).toBeNull();
      expect(update.section).toBeNull();
    });
  });

  describe('Code validation scenarios', () => {
    it('should accept various code formats', () => {
      const validCodes = [
        'WC-A-001',
        'TOILET-B-002',
        'T-1-F-A',
        'LOC-123',
      ];

      validCodes.forEach((code) => {
        const location: Location = {
          id: 'loc-test',
          code,
          name: 'Test Location',
          description: null,
          floor: null,
          section: null,
          area: null,
          coordinates: null,
          qr_code: null,
          photo_url: null,
          building_id: 'bld-123',
          organization_id: 'org-456',
          is_active: true,
          created_by: null,
          created_at: null,
          updated_at: null,
        };

        expect(location.code).toBe(code);
      });
    });
  });

  describe('Coordinates handling', () => {
    it('should handle valid coordinate objects', () => {
      const coordinates = [
        { lat: -6.2088, lng: 106.8456 },
        { latitude: -6.2088, longitude: 106.8456 },
        { x: 100, y: 200 },
      ];

      coordinates.forEach((coord) => {
        const location: Location = {
          id: 'loc-test',
          code: 'WC-001',
          name: 'Test',
          description: null,
          floor: null,
          section: null,
          area: null,
          coordinates: coord,
          qr_code: null,
          photo_url: null,
          building_id: 'bld-123',
          organization_id: 'org-456',
          is_active: true,
          created_by: null,
          created_at: null,
          updated_at: null,
        };

        expect(location.coordinates).toEqual(coord);
      });
    });

    it('should handle null coordinates', () => {
      const location: Location = {
        id: 'loc-test',
        code: 'WC-001',
        name: 'Test',
        description: null,
        floor: null,
        section: null,
        area: null,
        coordinates: null,
        qr_code: null,
        photo_url: null,
        building_id: 'bld-123',
        organization_id: 'org-456',
        is_active: true,
        created_by: null,
        created_at: null,
        updated_at: null,
      };

      expect(location.coordinates).toBeNull();
    });
  });

  describe('QR code scenarios', () => {
    it('should accept various QR code formats', () => {
      const qrCodes = [
        'QR-WC-A-001',
        'https://example.com/qr/wc-001',
        'base64encodedqrcode',
        '{"location": "WC-001"}',
      ];

      qrCodes.forEach((qr_code) => {
        const location: Location = {
          id: 'loc-test',
          code: 'WC-001',
          name: 'Test',
          description: null,
          floor: null,
          section: null,
          area: null,
          coordinates: null,
          qr_code,
          photo_url: null,
          building_id: 'bld-123',
          organization_id: 'org-456',
          is_active: true,
          created_by: null,
          created_at: null,
          updated_at: null,
        };

        expect(location.qr_code).toBe(qr_code);
      });
    });
  });

  describe('Multi-tenancy fields', () => {
    it('should properly link to building and organization', () => {
      const location: Location = {
        id: 'loc-123',
        code: 'WC-001',
        name: 'Test Toilet',
        description: null,
        floor: null,
        section: null,
        area: null,
        coordinates: null,
        qr_code: null,
        photo_url: null,
        building_id: 'building-abc',
        organization_id: 'org-xyz',
        is_active: true,
        created_by: 'user-123',
        created_at: new Date(),
        updated_at: new Date(),
      };

      expect(location.building_id).toBe('building-abc');
      expect(location.organization_id).toBe('org-xyz');
      expect(location.created_by).toBe('user-123');
    });
  });
});

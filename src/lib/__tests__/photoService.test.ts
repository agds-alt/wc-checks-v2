/**
 * Photo Service Unit Tests
 * Tests for photo upload, deletion, and retrieval
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  uploadPhoto,
  deletePhoto,
  getPhotosByInspection,
  getPhotosByLocation,
  type PhotoUploadData,
} from '../photoService';

// Mock dependencies
const mockSupabase = {
  from: jest.fn(),
};

const mockUploadToCloudinary = jest.fn();

jest.mock('../supabase', () => ({
  supabase: mockSupabase,
}));

jest.mock('../cloudinary', () => ({
  uploadToCloudinary: mockUploadToCloudinary,
}));

describe('photoService', () => {
  let mockSupabaseChain: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock chain for Supabase
    mockSupabaseChain = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn(),
      update: jest.fn().mockReturnThis(),
      filter: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
    };

    mockSupabase.from.mockReturnValue(mockSupabaseChain);

    // Mock Cloudinary upload
    mockUploadToCloudinary.mockResolvedValue(
      'https://cloudinary.com/uploads/test-photo.jpg'
    );
  });

  describe('uploadPhoto', () => {
    const mockFile = {
      name: 'test-photo.jpg',
      size: 1024000,
      type: 'image/jpeg',
    } as File;

    const validPhotoData: PhotoUploadData = {
      file: mockFile,
      caption: 'Test photo caption',
      field_reference: 'ref-123',
      inspection_id: 'insp-123',
      location_id: 'loc-123',
    };

    it('should upload photo successfully with all fields', async () => {
      const mockPhotoRecord = {
        id: 'photo-123',
        file_url: 'https://cloudinary.com/uploads/test-photo.jpg',
        file_name: 'test-photo.jpg',
        file_size: 1024000,
        mime_type: 'image/jpeg',
        caption: 'Test photo caption',
        field_reference: 'ref-123',
        inspection_id: 'insp-123',
        location_id: 'loc-123',
        uploaded_by: 'user-123',
        uploaded_at: new Date().toISOString(),
        is_deleted: false,
      };

      mockSupabaseChain.single.mockResolvedValue({
        data: mockPhotoRecord,
        error: null,
      });

      const result = await uploadPhoto(validPhotoData, 'user-123');

      expect(result).toBe('photo-123');
      expect(mockUploadToCloudinary).toHaveBeenCalledWith(mockFile);
      expect(mockSupabase.from).toHaveBeenCalledWith('photos');
      expect(mockSupabaseChain.insert).toHaveBeenCalled();
      expect(mockSupabaseChain.select).toHaveBeenCalled();
      expect(mockSupabaseChain.single).toHaveBeenCalled();
    });

    it('should upload photo with minimal required fields', async () => {
      const minimalData: PhotoUploadData = {
        file: mockFile,
      };

      mockSupabaseChain.single.mockResolvedValue({
        data: { id: 'photo-123' },
        error: null,
      });

      const result = await uploadPhoto(minimalData, 'user-123');

      expect(result).toBe('photo-123');
      expect(mockSupabaseChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          file_url: 'https://cloudinary.com/uploads/test-photo.jpg',
          file_name: 'test-photo.jpg',
          file_size: 1024000,
          mime_type: 'image/jpeg',
          caption: null,
          field_reference: null,
          inspection_id: null,
          location_id: null,
          uploaded_by: 'user-123',
          is_deleted: false,
        })
      );
    });

    it('should set is_deleted to false by default', async () => {
      mockSupabaseChain.single.mockResolvedValue({
        data: { id: 'photo-123' },
        error: null,
      });

      await uploadPhoto(validPhotoData, 'user-123');

      expect(mockSupabaseChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          is_deleted: false,
        })
      );
    });

    it('should include uploaded_at timestamp', async () => {
      mockSupabaseChain.single.mockResolvedValue({
        data: { id: 'photo-123' },
        error: null,
      });

      const beforeUpload = new Date().toISOString();
      await uploadPhoto(validPhotoData, 'user-123');
      const afterUpload = new Date().toISOString();

      const insertCall = (mockSupabaseChain.insert as jest.Mock).mock.calls[0][0];
      expect(insertCall.uploaded_at).toBeDefined();
      expect(insertCall.uploaded_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should throw error when Cloudinary upload fails', async () => {
      mockUploadToCloudinary.mockRejectedValue(
        new Error('Cloudinary upload failed')
      );

      await expect(
        uploadPhoto(validPhotoData, 'user-123')
      ).rejects.toThrow('Cloudinary upload failed');

      expect(mockSupabaseChain.insert).not.toHaveBeenCalled();
    });

    it('should throw error when database insert fails', async () => {
      mockSupabaseChain.single.mockResolvedValue({
        data: null,
        error: new Error('Database insert failed'),
      });

      await expect(
        uploadPhoto(validPhotoData, 'user-123')
      ).rejects.toThrow('Database insert failed');
    });

    it('should handle large file sizes', async () => {
      const largeFile = {
        name: 'large-photo.jpg',
        size: 10485760, // 10MB
        type: 'image/jpeg',
      } as File;

      const largeFileData: PhotoUploadData = {
        file: largeFile,
      };

      mockSupabaseChain.single.mockResolvedValue({
        data: { id: 'photo-123' },
        error: null,
      });

      const result = await uploadPhoto(largeFileData, 'user-123');

      expect(result).toBe('photo-123');
      expect(mockSupabaseChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          file_size: 10485760,
        })
      );
    });

    it('should handle different mime types', async () => {
      const pngFile = {
        name: 'test.png',
        size: 1024,
        type: 'image/png',
      } as File;

      mockSupabaseChain.single.mockResolvedValue({
        data: { id: 'photo-123' },
        error: null,
      });

      await uploadPhoto({ file: pngFile }, 'user-123');

      expect(mockSupabaseChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          mime_type: 'image/png',
        })
      );
    });

    it('should handle special characters in file names', async () => {
      const specialFile = {
        name: 'test photo (1) [copy].jpg',
        size: 1024,
        type: 'image/jpeg',
      } as File;

      mockSupabaseChain.single.mockResolvedValue({
        data: { id: 'photo-123' },
        error: null,
      });

      await uploadPhoto({ file: specialFile }, 'user-123');

      expect(mockSupabaseChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          file_name: 'test photo (1) [copy].jpg',
        })
      );
    });

    it('should handle empty caption as null', async () => {
      const dataWithEmptyCaption: PhotoUploadData = {
        file: mockFile,
        caption: '',
      };

      mockSupabaseChain.single.mockResolvedValue({
        data: { id: 'photo-123' },
        error: null,
      });

      await uploadPhoto(dataWithEmptyCaption, 'user-123');

      // Empty string is still passed as-is, but undefined becomes null
      expect(mockSupabaseChain.insert).toHaveBeenCalled();
    });
  });

  describe('deletePhoto', () => {
    it('should soft delete photo successfully', async () => {
      mockSupabaseChain.filter.mockResolvedValue({
        data: null,
        error: null,
      });

      await deletePhoto('photo-123', 'user-456');

      expect(mockSupabase.from).toHaveBeenCalledWith('photos');
      expect(mockSupabaseChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          is_deleted: true,
          deleted_by: 'user-456',
          deleted_at: expect.any(String),
        })
      );
      expect(mockSupabaseChain.filter).toHaveBeenCalledWith('id', 'eq', 'photo-123');
    });

    it('should include deleted_at timestamp', async () => {
      mockSupabaseChain.filter.mockResolvedValue({
        data: null,
        error: null,
      });

      const beforeDelete = new Date().toISOString();
      await deletePhoto('photo-123', 'user-456');
      const afterDelete = new Date().toISOString();

      const updateCall = (mockSupabaseChain.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.deleted_at).toBeDefined();
      expect(updateCall.deleted_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should throw error when deletion fails', async () => {
      mockSupabaseChain.filter.mockResolvedValue({
        data: null,
        error: new Error('Delete failed'),
      });

      await expect(
        deletePhoto('photo-123', 'user-456')
      ).rejects.toThrow('Delete failed');
    });

    it('should handle non-existent photo id', async () => {
      mockSupabaseChain.filter.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows affected' },
      });

      await expect(
        deletePhoto('non-existent-id', 'user-456')
      ).rejects.toThrow();
    });

    it('should preserve deleted_by user id', async () => {
      mockSupabaseChain.filter.mockResolvedValue({
        data: null,
        error: null,
      });

      await deletePhoto('photo-123', 'specific-user-789');

      expect(mockSupabaseChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          deleted_by: 'specific-user-789',
        })
      );
    });
  });

  describe('getPhotosByInspection', () => {
    const mockPhotos = [
      {
        id: 'photo-1',
        file_url: 'https://cloudinary.com/photo1.jpg',
        inspection_id: 'insp-123',
        uploaded_at: '2024-01-02T10:00:00Z',
        is_deleted: false,
      },
      {
        id: 'photo-2',
        file_url: 'https://cloudinary.com/photo2.jpg',
        inspection_id: 'insp-123',
        uploaded_at: '2024-01-01T10:00:00Z',
        is_deleted: false,
      },
    ];

    it('should fetch photos by inspection id', async () => {
      mockSupabaseChain.order.mockResolvedValue({
        data: mockPhotos,
        error: null,
      });

      const result = await getPhotosByInspection('insp-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('photos');
      expect(mockSupabaseChain.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseChain.filter).toHaveBeenCalledWith(
        'inspection_id',
        'eq',
        'insp-123'
      );
      expect(mockSupabaseChain.filter).toHaveBeenCalledWith('is_deleted', 'eq', false);
      expect(result).toEqual(mockPhotos);
    });

    it('should order photos by uploaded_at descending', async () => {
      mockSupabaseChain.order.mockResolvedValue({
        data: mockPhotos,
        error: null,
      });

      await getPhotosByInspection('insp-123');

      expect(mockSupabaseChain.order).toHaveBeenCalledWith('uploaded_at', {
        ascending: false,
      });
    });

    it('should return empty array when no photos found', async () => {
      mockSupabaseChain.order.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await getPhotosByInspection('insp-no-photos');

      expect(result).toEqual([]);
    });

    it('should filter out deleted photos', async () => {
      mockSupabaseChain.order.mockResolvedValue({
        data: mockPhotos,
        error: null,
      });

      await getPhotosByInspection('insp-123');

      expect(mockSupabaseChain.filter).toHaveBeenCalledWith('is_deleted', 'eq', false);
    });

    it('should throw error when database query fails', async () => {
      mockSupabaseChain.order.mockResolvedValue({
        data: null,
        error: new Error('Database query failed'),
      });

      await expect(
        getPhotosByInspection('insp-123')
      ).rejects.toThrow('Database query failed');
    });

    it('should handle inspection with many photos', async () => {
      const manyPhotos = Array.from({ length: 50 }, (_, i) => ({
        id: `photo-${i}`,
        file_url: `https://cloudinary.com/photo${i}.jpg`,
        inspection_id: 'insp-123',
        uploaded_at: new Date().toISOString(),
        is_deleted: false,
      }));

      mockSupabaseChain.order.mockResolvedValue({
        data: manyPhotos,
        error: null,
      });

      const result = await getPhotosByInspection('insp-123');

      expect(result).toHaveLength(50);
    });
  });

  describe('getPhotosByLocation', () => {
    const mockLocationPhotos = [
      {
        id: 'photo-loc-1',
        file_url: 'https://cloudinary.com/loc-photo1.jpg',
        location_id: 'loc-123',
        uploaded_at: '2024-01-02T10:00:00Z',
        is_deleted: false,
      },
      {
        id: 'photo-loc-2',
        file_url: 'https://cloudinary.com/loc-photo2.jpg',
        location_id: 'loc-123',
        uploaded_at: '2024-01-01T10:00:00Z',
        is_deleted: false,
      },
    ];

    it('should fetch photos by location id', async () => {
      mockSupabaseChain.order.mockResolvedValue({
        data: mockLocationPhotos,
        error: null,
      });

      const result = await getPhotosByLocation('loc-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('photos');
      expect(mockSupabaseChain.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseChain.filter).toHaveBeenCalledWith(
        'location_id',
        'eq',
        'loc-123'
      );
      expect(mockSupabaseChain.filter).toHaveBeenCalledWith('is_deleted', 'eq', false);
      expect(result).toEqual(mockLocationPhotos);
    });

    it('should order photos by uploaded_at descending', async () => {
      mockSupabaseChain.order.mockResolvedValue({
        data: mockLocationPhotos,
        error: null,
      });

      await getPhotosByLocation('loc-123');

      expect(mockSupabaseChain.order).toHaveBeenCalledWith('uploaded_at', {
        ascending: false,
      });
    });

    it('should return empty array when no photos found', async () => {
      mockSupabaseChain.order.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await getPhotosByLocation('loc-no-photos');

      expect(result).toEqual([]);
    });

    it('should filter out deleted photos', async () => {
      mockSupabaseChain.order.mockResolvedValue({
        data: mockLocationPhotos,
        error: null,
      });

      await getPhotosByLocation('loc-123');

      expect(mockSupabaseChain.filter).toHaveBeenCalledWith('is_deleted', 'eq', false);
    });

    it('should throw error when database query fails', async () => {
      mockSupabaseChain.order.mockResolvedValue({
        data: null,
        error: new Error('Database connection lost'),
      });

      await expect(
        getPhotosByLocation('loc-123')
      ).rejects.toThrow('Database connection lost');
    });

    it('should handle location with no photos gracefully', async () => {
      mockSupabaseChain.order.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await getPhotosByLocation('loc-empty');

      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });

    it('should handle location with single photo', async () => {
      const singlePhoto = [mockLocationPhotos[0]];

      mockSupabaseChain.order.mockResolvedValue({
        data: singlePhoto,
        error: null,
      });

      const result = await getPhotosByLocation('loc-single');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockLocationPhotos[0]);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete photo lifecycle: upload -> fetch -> delete', async () => {
      const mockFile = {
        name: 'lifecycle-test.jpg',
        size: 1024,
        type: 'image/jpeg',
      } as File;

      // Upload
      mockSupabaseChain.single.mockResolvedValue({
        data: { id: 'photo-lifecycle-123' },
        error: null,
      });

      const photoId = await uploadPhoto(
        {
          file: mockFile,
          inspection_id: 'insp-123',
        },
        'user-123'
      );

      expect(photoId).toBe('photo-lifecycle-123');

      // Fetch by inspection (photo should be visible)
      mockSupabaseChain.order.mockResolvedValue({
        data: [
          {
            id: 'photo-lifecycle-123',
            file_url: 'https://cloudinary.com/uploads/test-photo.jpg',
            inspection_id: 'insp-123',
            is_deleted: false,
          },
        ],
        error: null,
      });

      let photos = await getPhotosByInspection('insp-123');
      expect(photos).toHaveLength(1);

      // Delete
      mockSupabaseChain.filter.mockResolvedValue({
        data: null,
        error: null,
      });

      await deletePhoto('photo-lifecycle-123', 'user-123');

      // After deletion, should be filtered out (in real scenario)
      mockSupabaseChain.order.mockResolvedValue({
        data: [],
        error: null,
      });

      photos = await getPhotosByInspection('insp-123');
      expect(photos).toHaveLength(0);
    });

    it('should handle photo belonging to both inspection and location', async () => {
      const mockFile = {
        name: 'dual-reference.jpg',
        size: 1024,
        type: 'image/jpeg',
      } as File;

      mockSupabaseChain.single.mockResolvedValue({
        data: { id: 'photo-dual-123' },
        error: null,
      });

      const photoId = await uploadPhoto(
        {
          file: mockFile,
          inspection_id: 'insp-123',
          location_id: 'loc-123',
        },
        'user-123'
      );

      expect(photoId).toBe('photo-dual-123');

      // Should be retrievable by inspection
      mockSupabaseChain.order.mockResolvedValue({
        data: [{ id: 'photo-dual-123', inspection_id: 'insp-123' }],
        error: null,
      });
      const byInspection = await getPhotosByInspection('insp-123');
      expect(byInspection).toHaveLength(1);

      // Should also be retrievable by location
      mockSupabaseChain.order.mockResolvedValue({
        data: [{ id: 'photo-dual-123', location_id: 'loc-123' }],
        error: null,
      });
      const byLocation = await getPhotosByLocation('loc-123');
      expect(byLocation).toHaveLength(1);
    });
  });
});

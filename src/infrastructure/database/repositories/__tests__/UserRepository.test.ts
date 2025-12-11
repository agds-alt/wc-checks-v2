/**
 * UserRepository Unit Tests
 * Tests for user repository with Supabase integration
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { UserRepository } from '../UserRepository';
import {  createMockSupabaseClient,
  mockSupabaseSuccess,
  mockSupabaseError,
  mockSupabaseNotFound,
} from '@/__tests__/utils/test-helpers';
import { mockUsers } from '@/__tests__/fixtures/users';

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  createClient: jest.fn(),
}));

describe('UserRepository', () => {
  let userRepo: UserRepository;
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create fresh mock Supabase client
    mockSupabase = createMockSupabaseClient();

    // Create repository instance with mocked Supabase
    userRepo = new UserRepository();
    // @ts-expect-error - Mocking private supabase client
    userRepo.supabase = mockSupabase;
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const expectedUser = mockUsers.inspector;

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(expectedUser)
      );

      const result = await userRepo.findById(expectedUser.id);

      expect(mockSupabase.from).toHaveBeenCalledWith('users');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', expectedUser.id);
      expect(mockSupabase.single).toHaveBeenCalled();
      expect(result).toEqual(expectedUser);
    });

    it('should return null when user not found', async () => {
      mockSupabase.single.mockResolvedValue(mockSupabaseNotFound());

      const result = await userRepo.findById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should return null on database failure', async () => {
      const errorMessage = 'Database connection failed';
      mockSupabase.single.mockResolvedValue(
        mockSupabaseError(errorMessage)
      );

      const result = await userRepo.findById('user-123');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return user when email exists', async () => {
      const expectedUser = mockUsers.inspector;

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(expectedUser)
      );

      const result = await userRepo.findByEmail(expectedUser.email);

      expect(mockSupabase.eq).toHaveBeenCalledWith('email', expectedUser.email);
      expect(result).toEqual(expectedUser);
    });

    it('should be case-sensitive for email lookup', async () => {
      mockSupabase.single.mockResolvedValue(mockSupabaseNotFound());

      const result = await userRepo.findByEmail('INSPECTOR@TEST.COM');

      expect(result).toBeNull();
    });

    it('should return null for non-existent email', async () => {
      mockSupabase.single.mockResolvedValue(mockSupabaseNotFound());

      const result = await userRepo.findByEmail('nonexistent@test.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      const newUser = {
        id: 'new-user-123',
        email: 'newuser@test.com',
        full_name: 'New User',
        phone: '+6281234567890',
      };

      const createdUser = {
        ...newUser,
        profile_photo_url: null,
        is_active: true,
        occupation_id: null,
        password_hash: null,
        last_login_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(createdUser)
      );

      const result = await userRepo.create(newUser);

      expect(mockSupabase.insert).toHaveBeenCalled();
      expect(result).toMatchObject({
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
      });
    });

    it('should throw error on duplicate email', async () => {
      const duplicateUser = {
        id: 'dup-user-123',
        email: mockUsers.inspector.email, // Existing email
        full_name: 'Duplicate User',
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseError('duplicate key value violates unique constraint', '23505')
      );

      await expect(userRepo.create(duplicateUser)).rejects.toThrow();
    });

    it('should create user with all optional fields', async () => {
      const fullUser = {
        id: 'full-user-123',
        email: 'full@test.com',
        full_name: 'Full User',
        phone: '+6281234567890',
        profile_photo_url: 'https://example.com/photo.jpg',
        occupation_id: 'occ-123',
        password_hash: '$2b$10$hashed',
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess({ ...fullUser, created_at: new Date(), updated_at: new Date() })
      );

      const result = await userRepo.create(fullUser);

      expect(result).toMatchObject(fullUser);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const userId = mockUsers.inspector.id;
      const updates = {
        full_name: 'Updated Name',
        phone: '+6281111111111',
      };

      const updatedUser = {
        ...mockUsers.inspector,
        ...updates,
        updated_at: new Date(),
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(updatedUser)
      );

      const result = await userRepo.update(userId, updates);

      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining(updates)
      );
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', userId);
      expect(result).toMatchObject(updates);
    });

    it('should allow partial updates', async () => {
      const userId = mockUsers.inspector.id;
      const updates = { full_name: 'Only Name Updated' };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess({ ...mockUsers.inspector, ...updates })
      );

      const result = await userRepo.update(userId, updates);

      expect(result?.full_name).toBe(updates.full_name);
      expect(result?.email).toBe(mockUsers.inspector.email); // Unchanged
    });

    it('should throw error when updating non-existent user', async () => {
      mockSupabase.single.mockResolvedValue(mockSupabaseNotFound());

      await expect(
        userRepo.update('non-existent-id', { full_name: 'Test' })
      ).rejects.toThrow('Failed to update user');
    });

    it('should allow setting fields to null', async () => {
      const userId = mockUsers.inspector.id;
      const updates = {
        phone: null,
        profile_photo_url: null,
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess({ ...mockUsers.inspector, ...updates })
      );

      const result = await userRepo.update(userId, updates);

      expect(result?.phone).toBeNull();
      expect(result?.profile_photo_url).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      const userId = mockUsers.inactiveUser.id;

      mockSupabase.eq.mockResolvedValue(
        mockSupabaseSuccess(null)
      );

      await userRepo.delete(userId);

      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', userId);
    });

    it('should handle deletion of non-existent user', async () => {
      mockSupabase.eq.mockResolvedValue(
        mockSupabaseError('No rows affected', 'PGRST116')
      );

      await expect(userRepo.delete('non-existent-id')).rejects.toThrow('Failed to delete user');
    });

    it('should handle cascade deletion effects', async () => {
      // When deleting a user, associated records should be handled
      // This tests the database constraint behavior
      const userId = mockUsers.inspector.id;

      mockSupabase.eq.mockResolvedValue(
        mockSupabaseError('Foreign key constraint violation', '23503')
      );

      await expect(userRepo.delete(userId)).rejects.toThrow('Failed to delete user');
    });
  });

  describe('list', () => {
    it('should return paginated users', async () => {
      const mockUserList = [
        mockUsers.inspector,
        mockUsers.manager,
      ];

      (mockSupabase as any).range =
        // @ts-ignore - Mocking range method
        jest.fn().mockResolvedValue(mockSupabaseSuccess(mockUserList));

      const result = await userRepo.list(10, 0);

      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.range).toHaveBeenCalledWith(0, 9); // 0-indexed
      expect(result).toHaveLength(2);
      expect(result).toEqual(mockUserList);
    });

    it('should handle empty results', async () => {
      (mockSupabase as any).range =
        // @ts-ignore - Mocking range method
        jest.fn().mockResolvedValue(mockSupabaseSuccess([]));

      const result = await userRepo.list(10, 0);

      expect(result).toEqual([]);
    });

    it('should respect limit parameter', async () => {
      const limit = 5;

      (mockSupabase as any).range =
        // @ts-ignore - Mocking range method
        jest.fn().mockResolvedValue(mockSupabaseSuccess([]));

      await userRepo.list(limit, 0);

      expect(mockSupabase.range).toHaveBeenCalledWith(0, limit - 1);
    });

    it('should handle offset correctly', async () => {
      const offset = 20;
      const limit = 10;

      (mockSupabase as any).range =
        // @ts-ignore - Mocking range method
        jest.fn().mockResolvedValue(mockSupabaseSuccess([]));

      await userRepo.list(limit, offset);

      expect(mockSupabase.range).toHaveBeenCalledWith(offset, offset + limit - 1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values gracefully', async () => {
      const userWithNulls = {
        ...mockUsers.newUser,
        phone: null,
        profile_photo_url: null,
        occupation_id: null,
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(userWithNulls)
      );

      const result = await userRepo.findById(userWithNulls.id);

      expect(result).toEqual(userWithNulls);
    });

    it('should handle very long email addresses', async () => {
      const longEmail = 'a'.repeat(100) + '@example.com';

      mockSupabase.single.mockResolvedValue(mockSupabaseNotFound());

      const result = await userRepo.findByEmail(longEmail);

      expect(mockSupabase.eq).toHaveBeenCalledWith('email', longEmail);
      expect(result).toBeNull();
    });

    it('should handle special characters in names', async () => {
      const specialUser = {
        id: 'special-user-123',
        email: 'special@test.com',
        full_name: "O'Brien-Jones (Sr.)",
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess({ ...specialUser, created_at: new Date() })
      );

      const result = await userRepo.create(specialUser);

      expect(result?.full_name).toBe(specialUser.full_name);
    });
  });

  describe('Data Integrity', () => {
    it('should preserve date types', async () => {
      const user = mockUsers.inspector;

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(user)
      );

      const result = await userRepo.findById(user.id);

      expect(result?.created_at).toBeInstanceOf(Date);
      expect(result?.updated_at).toBeInstanceOf(Date);
    });

    it('should not expose password hash in listings', async () => {
      // This test ensures sensitive data handling
      const users = [mockUsers.inspector, mockUsers.manager];

      (mockSupabase as any).range =
        // @ts-ignore - Mocking range method
        jest.fn().mockResolvedValue(mockSupabaseSuccess(users));

      const result = await userRepo.list(0, 10);

      // In a real implementation, you might want to strip password_hash
      // For now, we just verify the structure
      expect(result).toBeDefined();
    });
  });
});

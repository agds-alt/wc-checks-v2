import { describe, it, expect } from '@jest/globals';
import type { User, UserWithRole, CreateUserInput, UpdateUserInput } from '../../entities/User';

describe('User Entity', () => {
  describe('User interface', () => {
    it('should create a valid User object with required fields', () => {
      const user: User = {
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        phone: '+628123456789',
        profile_photo_url: 'https://example.com/photo.jpg',
        is_active: true,
        occupation_id: 'occ-123',
        password_hash: 'hashed_password',
        last_login_at: new Date('2024-01-01'),
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      expect(user.id).toBe('user-123');
      expect(user.email).toBe('test@example.com');
      expect(user.full_name).toBe('Test User');
      expect(user.is_active).toBe(true);
    });

    it('should allow nullable fields', () => {
      const user: User = {
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        phone: null,
        profile_photo_url: null,
        is_active: null,
        occupation_id: null,
        password_hash: null,
        last_login_at: null,
        created_at: null,
        updated_at: null,
      };

      expect(user.phone).toBeNull();
      expect(user.profile_photo_url).toBeNull();
      expect(user.occupation_id).toBeNull();
    });
  });

  describe('UserWithRole interface', () => {
    it('should extend User with role information', () => {
      const userWithRole: UserWithRole = {
        id: 'user-123',
        email: 'admin@example.com',
        full_name: 'Admin User',
        phone: '+628123456789',
        profile_photo_url: null,
        is_active: true,
        occupation_id: null,
        password_hash: 'hashed',
        last_login_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        role_level: 10,
        role_name: 'SUPER_ADMIN',
      };

      expect(userWithRole.role_level).toBe(10);
      expect(userWithRole.role_name).toBe('SUPER_ADMIN');
      expect(userWithRole.email).toBe('admin@example.com');
    });
  });

  describe('CreateUserInput interface', () => {
    it('should create user with required fields only', () => {
      const input: CreateUserInput = {
        id: 'user-456',
        email: 'new@example.com',
        full_name: 'New User',
      };

      expect(input.id).toBe('user-456');
      expect(input.email).toBe('new@example.com');
      expect(input.full_name).toBe('New User');
    });

    it('should create user with all optional fields', () => {
      const input: CreateUserInput = {
        id: 'user-789',
        email: 'complete@example.com',
        full_name: 'Complete User',
        phone: '+628123456789',
        profile_photo_url: 'https://example.com/avatar.jpg',
        occupation_id: 'occ-001',
        password_hash: 'hashed_pwd',
      };

      expect(input.phone).toBe('+628123456789');
      expect(input.profile_photo_url).toBe('https://example.com/avatar.jpg');
      expect(input.occupation_id).toBe('occ-001');
    });
  });

  describe('UpdateUserInput interface', () => {
    it('should allow partial updates', () => {
      const updateFullName: UpdateUserInput = {
        full_name: 'Updated Name',
      };

      expect(updateFullName.full_name).toBe('Updated Name');
      expect(updateFullName.phone).toBeUndefined();
    });

    it('should allow updating multiple fields', () => {
      const update: UpdateUserInput = {
        full_name: 'John Doe',
        phone: '+628987654321',
        is_active: false,
      };

      expect(update.full_name).toBe('John Doe');
      expect(update.phone).toBe('+628987654321');
      expect(update.is_active).toBe(false);
    });

    it('should allow setting fields to null', () => {
      const update: UpdateUserInput = {
        phone: null,
        profile_photo_url: null,
      };

      expect(update.phone).toBeNull();
      expect(update.profile_photo_url).toBeNull();
    });
  });

  describe('Email validation scenarios', () => {
    it('should accept valid email formats', () => {
      const validEmails = [
        'user@example.com',
        'test.user@example.co.id',
        'admin+test@company.com',
      ];

      validEmails.forEach((email) => {
        const user: User = {
          id: 'user-test',
          email,
          full_name: 'Test',
          phone: null,
          profile_photo_url: null,
          is_active: true,
          occupation_id: null,
          password_hash: null,
          last_login_at: null,
          created_at: null,
          updated_at: null,
        };

        expect(user.email).toBe(email);
      });
    });
  });
});

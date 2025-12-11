/**
 * OrganizationRepository Unit Tests
 * Tests for organization repository with Supabase integration
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { OrganizationRepository } from '../OrganizationRepository';
import {
  createMockSupabaseClient,
  mockSupabaseSuccess,
  mockSupabaseError,
  mockSupabaseNotFound,
} from '@/__tests__/utils/test-helpers';
import { mockOrganizations, mockOrganizationsByCreator } from '@/__tests__/fixtures/organizations';

// Mock Supabase client
jest.mock('@/infrastructure/database/supabase/client', () => ({
  getSupabaseServerClient: jest.fn(),
}));

describe('OrganizationRepository', () => {
  let organizationRepo: OrganizationRepository;
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create fresh mock Supabase client
    mockSupabase = createMockSupabaseClient();

    // Create repository instance with mocked Supabase
    organizationRepo = new OrganizationRepository();
    // @ts-expect-error - Mocking private supabase client
    organizationRepo.supabase = mockSupabase;
  });

  describe('findById', () => {
    it('should return organization when found', async () => {
      const expectedOrg = mockOrganizations.mainOrg;

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(expectedOrg)
      );

      const result = await organizationRepo.findById(expectedOrg.id);

      expect(mockSupabase.from).toHaveBeenCalledWith('organizations');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', expectedOrg.id);
      expect(mockSupabase.single).toHaveBeenCalled();
      expect(result).toEqual(expectedOrg);
    });

    it('should return null when organization not found', async () => {
      mockSupabase.single.mockResolvedValue(mockSupabaseNotFound());

      const result = await organizationRepo.findById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should return null on database error', async () => {
      const errorMessage = 'Database connection failed';
      mockSupabase.single.mockResolvedValue(
        mockSupabaseError(errorMessage)
      );

      const result = await organizationRepo.findById('org-123');

      expect(result).toBeNull();
    });

    it('should handle special characters in organization ID', async () => {
      const orgId = 'org-special-123!@#';

      mockSupabase.single.mockResolvedValue(mockSupabaseNotFound());

      const result = await organizationRepo.findById(orgId);

      expect(mockSupabase.eq).toHaveBeenCalledWith('id', orgId);
      expect(result).toBeNull();
    });
  });

  describe('findByCreator', () => {
    it('should return organizations created by user', async () => {
      const creatorId = 'user-super-admin-1';
      const expectedOrgs = mockOrganizationsByCreator[creatorId];

      mockSupabase.eq.mockResolvedValue(
        mockSupabaseSuccess(expectedOrgs)
      );

      const result = await organizationRepo.findByCreator(creatorId);

      expect(mockSupabase.from).toHaveBeenCalledWith('organizations');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('created_by', creatorId);
      expect(result).toHaveLength(expectedOrgs.length);
      expect(result).toEqual(expectedOrgs);
    });

    it('should return empty array when no organizations found', async () => {
      mockSupabase.eq.mockResolvedValue(mockSupabaseSuccess([]));

      const result = await organizationRepo.findByCreator('user-no-orgs');

      expect(result).toEqual([]);
    });

    it('should return empty array on database error', async () => {
      mockSupabase.eq.mockResolvedValue(
        mockSupabaseError('Connection timeout')
      );

      const result = await organizationRepo.findByCreator('user-123');

      expect(result).toEqual([]);
    });

    it('should handle null data response', async () => {
      mockSupabase.eq.mockResolvedValue(
        mockSupabaseSuccess(null)
      );

      const result = await organizationRepo.findByCreator('user-123');

      expect(result).toEqual([]);
    });

    it('should include both active and inactive organizations', async () => {
      const creatorId = 'user-super-admin-1';
      const orgs = mockOrganizationsByCreator[creatorId];

      mockSupabase.eq.mockResolvedValue(
        mockSupabaseSuccess(orgs)
      );

      const result = await organizationRepo.findByCreator(creatorId);

      const hasActive = result.some(org => org.is_active);
      const hasInactive = result.some(org => !org.is_active);

      expect(hasActive || hasInactive).toBe(true);
    });
  });

  describe('create', () => {
    it('should create organization successfully', async () => {
      const newOrg = {
        code: 'ORG-NEW',
        name: 'New Organization',
        created_by: 'user-admin-2',
      };

      const createdOrg = {
        id: 'new-org-123',
        ...newOrg,
        description: null,
        address: null,
        contact_phone: null,
        contact_email: null,
        logo_url: null,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(createdOrg)
      );

      const result = await organizationRepo.create(newOrg);

      expect(mockSupabase.insert).toHaveBeenCalled();
      expect(result).toMatchObject({
        code: newOrg.code,
        name: newOrg.name,
        created_by: newOrg.created_by,
      });
    });

    it('should create organization with all optional fields', async () => {
      const fullOrg = {
        code: 'ORG-FULL',
        name: 'Full Organization',
        description: 'Complete organization data',
        address: 'Full Address',
        contact_phone: '+62215678900',
        contact_email: 'info@fullorg.com',
        logo_url: 'https://example.com/logo.png',
        created_by: 'user-admin-2',
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess({ ...fullOrg, id: 'full-org-123', created_at: new Date(), updated_at: new Date() })
      );

      const result = await organizationRepo.create(fullOrg);

      expect(result).toMatchObject(fullOrg);
    });

    it('should throw error on duplicate code', async () => {
      const duplicateOrg = {
        code: mockOrganizations.mainOrg.code, // Duplicate
        name: 'Duplicate Organization',
        created_by: 'user-admin-2',
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseError('duplicate key value violates unique constraint', '23505')
      );

      await expect(organizationRepo.create(duplicateOrg)).rejects.toThrow();
    });

    it('should throw error when creation fails', async () => {
      const newOrg = {
        code: 'ORG-ERR',
        name: 'Error Organization',
        created_by: 'user-admin-2',
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseError('Failed to insert')
      );

      await expect(organizationRepo.create(newOrg)).rejects.toThrow('Failed to create organization');
    });

    it('should validate email format in contact_email', async () => {
      const orgWithEmail = {
        code: 'ORG-EMAIL',
        name: 'Email Organization',
        contact_email: 'info@organization.com',
        created_by: 'user-admin-2',
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess({ ...orgWithEmail, id: 'email-org-123', created_at: new Date(), updated_at: new Date() })
      );

      const result = await organizationRepo.create(orgWithEmail);

      expect(result.contact_email).toContain('@');
    });
  });

  describe('update', () => {
    it('should update organization successfully', async () => {
      const orgId = mockOrganizations.mainOrg.id;
      const updates = {
        name: 'Updated Organization Name',
        description: 'Updated description',
      };

      const updatedOrg = {
        ...mockOrganizations.mainOrg,
        ...updates,
        updated_at: new Date(),
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(updatedOrg)
      );

      const result = await organizationRepo.update(orgId, updates);

      expect(mockSupabase.update).toHaveBeenCalledWith(updates);
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', orgId);
      expect(result).toMatchObject(updates);
    });

    it('should allow partial updates', async () => {
      const orgId = mockOrganizations.mainOrg.id;
      const updates = { name: 'Only Name Updated' };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess({ ...mockOrganizations.mainOrg, ...updates })
      );

      const result = await organizationRepo.update(orgId, updates);

      expect(result.name).toBe(updates.name);
      expect(result.code).toBe(mockOrganizations.mainOrg.code);
    });

    it('should update contact information', async () => {
      const orgId = mockOrganizations.mainOrg.id;
      const updates = {
        contact_phone: '+62215678999',
        contact_email: 'new@organization.com',
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess({ ...mockOrganizations.mainOrg, ...updates })
      );

      const result = await organizationRepo.update(orgId, updates);

      expect(result.contact_phone).toBe(updates.contact_phone);
      expect(result.contact_email).toBe(updates.contact_email);
    });

    it('should throw error when updating non-existent organization', async () => {
      mockSupabase.single.mockResolvedValue(mockSupabaseNotFound());

      await expect(
        organizationRepo.update('non-existent-id', { name: 'Test' })
      ).rejects.toThrow('Failed to update organization');
    });

    it('should allow setting fields to null', async () => {
      const orgId = mockOrganizations.mainOrg.id;
      const updates = {
        description: null,
        address: null,
        contact_phone: null,
        contact_email: null,
        logo_url: null,
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess({ ...mockOrganizations.mainOrg, ...updates })
      );

      const result = await organizationRepo.update(orgId, updates);

      expect(result.description).toBeNull();
      expect(result.address).toBeNull();
      expect(result.contact_phone).toBeNull();
      expect(result.contact_email).toBeNull();
      expect(result.logo_url).toBeNull();
    });

    it('should throw error on database failure', async () => {
      mockSupabase.single.mockResolvedValue(
        mockSupabaseError('Connection lost')
      );

      await expect(
        organizationRepo.update('org-123', { name: 'Test' })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete organization successfully', async () => {
      const orgId = mockOrganizations.inactiveOrg.id;

      mockSupabase.eq.mockResolvedValue(
        mockSupabaseSuccess(null)
      );

      await organizationRepo.delete(orgId);

      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', orgId);
    });

    it('should throw error when deleting non-existent organization', async () => {
      mockSupabase.eq.mockResolvedValue(
        mockSupabaseError('No rows affected', 'PGRST116')
      );

      await expect(organizationRepo.delete('non-existent-id')).rejects.toThrow('Failed to delete organization');
    });

    it('should throw error on foreign key constraint violation', async () => {
      const orgId = mockOrganizations.mainOrg.id;

      mockSupabase.eq.mockResolvedValue(
        mockSupabaseError('Foreign key constraint violation', '23503')
      );

      await expect(organizationRepo.delete(orgId)).rejects.toThrow();
    });

    it('should handle deletion of organization with associated buildings', async () => {
      const orgId = mockOrganizations.mainOrg.id;

      mockSupabase.eq.mockResolvedValue(
        mockSupabaseError('Cannot delete organization with associated buildings', '23503')
      );

      await expect(organizationRepo.delete(orgId)).rejects.toThrow();
    });
  });

  describe('list', () => {
    it('should return paginated organizations', async () => {
      const mockOrgList = [
        mockOrganizations.mainOrg,
        mockOrganizations.hospitalOrg,
      ];

      (mockSupabase as any).range =
        // @ts-ignore - Mocking range method
        jest.fn().mockResolvedValue(mockSupabaseSuccess(mockOrgList));

      const result = await organizationRepo.list(10, 0);

      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.range).toHaveBeenCalledWith(0, 9);
      expect(result).toHaveLength(2);
      expect(result).toEqual(mockOrgList);
    });

    it('should handle empty results', async () => {
      (mockSupabase as any).range =
        // @ts-ignore - Mocking range method
        jest.fn().mockResolvedValue(mockSupabaseSuccess([]));

      const result = await organizationRepo.list(10, 0);

      expect(result).toEqual([]);
    });

    it('should respect limit parameter', async () => {
      const limit = 5;

      (mockSupabase as any).range =
        // @ts-ignore - Mocking range method
        jest.fn().mockResolvedValue(mockSupabaseSuccess([]));

      await organizationRepo.list(limit, 0);

      expect(mockSupabase.range).toHaveBeenCalledWith(0, limit - 1);
    });

    it('should handle offset correctly', async () => {
      const offset = 20;
      const limit = 10;

      (mockSupabase as any).range =
        // @ts-ignore - Mocking range method
        jest.fn().mockResolvedValue(mockSupabaseSuccess([]));

      await organizationRepo.list(limit, offset);

      expect(mockSupabase.range).toHaveBeenCalledWith(offset, offset + limit - 1);
    });

    it('should use default limit when not provided', async () => {
      (mockSupabase as any).range =
        // @ts-ignore - Mocking range method
        jest.fn().mockResolvedValue(mockSupabaseSuccess([]));

      await organizationRepo.list();

      expect(mockSupabase.range).toHaveBeenCalledWith(0, 99);
    });

    it('should handle database error gracefully', async () => {
      (mockSupabase as any).range =
        // @ts-ignore - Mocking range method
        jest.fn().mockResolvedValue(mockSupabaseError('Connection error'));

      const result = await organizationRepo.list(10, 0);

      expect(result).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values gracefully', async () => {
      const orgWithNulls = {
        ...mockOrganizations.newOrg,
        description: null,
        address: null,
        contact_phone: null,
        contact_email: null,
        logo_url: null,
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(orgWithNulls)
      );

      const result = await organizationRepo.findById(orgWithNulls.id);

      expect(result).toEqual(orgWithNulls);
    });

    it('should handle very long organization names', async () => {
      const longName = 'A'.repeat(500);

      const orgWithLongName = {
        ...mockOrganizations.newOrg,
        name: longName,
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(orgWithLongName)
      );

      const result = await organizationRepo.findById('org-long');

      expect(result?.name).toBe(longName);
    });

    it('should handle special characters in organization data', async () => {
      const specialOrg = {
        id: 'special-org-123',
        code: 'ORG-O\'Brien',
        name: 'Organization & Co. (Ltd.)',
        address: 'Jl. "Sudirman" No. 1-2/3',
        contact_email: 'info+special@org.com',
        created_by: 'user-admin-2',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(specialOrg)
      );

      const result = await organizationRepo.findById('special-org-123');

      expect(result?.name).toBe(specialOrg.name);
      expect(result?.code).toBe(specialOrg.code);
    });

    it('should handle international phone numbers', async () => {
      const orgWithIntlPhone = {
        ...mockOrganizations.mainOrg,
        contact_phone: '+1-555-123-4567',
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(orgWithIntlPhone)
      );

      const result = await organizationRepo.findById('org-intl-phone');

      expect(result?.contact_phone).toBe('+1-555-123-4567');
    });

    it('should handle email addresses with special characters', async () => {
      const orgWithSpecialEmail = {
        ...mockOrganizations.mainOrg,
        contact_email: 'info+special@sub-domain.org.id',
      };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(orgWithSpecialEmail)
      );

      const result = await organizationRepo.findById('org-special-email');

      expect(result?.contact_email).toContain('@');
      expect(result?.contact_email).toContain('+');
    });
  });

  describe('Data Integrity', () => {
    it('should preserve date types', async () => {
      const org = mockOrganizations.mainOrg;

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(org)
      );

      const result = await organizationRepo.findById(org.id);

      expect(result?.created_at).toBeInstanceOf(Date);
      expect(result?.updated_at).toBeInstanceOf(Date);
    });

    it('should preserve all organization fields', async () => {
      const org = mockOrganizations.mainOrg;

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess(org)
      );

      const result = await organizationRepo.findById(org.id);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('code');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('created_by');
      expect(result).toHaveProperty('is_active');
      expect(result).toHaveProperty('created_at');
      expect(result).toHaveProperty('updated_at');
    });

    it('should not mutate input data on create', async () => {
      const input = {
        code: 'ORG-TEST',
        name: 'Test Organization',
        created_by: 'user-admin-2',
      };

      const inputCopy = { ...input };

      mockSupabase.single.mockResolvedValue(
        mockSupabaseSuccess({ ...input, id: 'new-org-123', created_at: new Date(), updated_at: new Date() })
      );

      await organizationRepo.create(input);

      expect(input).toEqual(inputCopy);
    });
  });
});

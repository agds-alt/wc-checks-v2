/**
 * User Test Fixtures
 */

import type { User } from '@/domain/entities/User';

export const mockUsers = {
  superAdmin: {
    id: 'user-super-admin-1',
    email: 'superadmin@test.com',
    full_name: 'Super Admin User',
    phone: '+6281234567890',
    profile_photo_url: 'https://example.com/photos/admin.jpg',
    is_active: true,
    occupation_id: 'occ-admin',
    password_hash: '$2b$10$hashedpassword',
    last_login_at: new Date('2024-01-15T10:00:00Z'),
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-15T10:00:00Z'),
  } as User,

  admin: {
    id: 'user-admin-2',
    email: 'admin@test.com',
    full_name: 'Admin User',
    phone: '+6281234567891',
    profile_photo_url: 'https://example.com/photos/admin2.jpg',
    is_active: true,
    occupation_id: 'occ-admin',
    password_hash: '$2b$10$hashedpassword',
    last_login_at: new Date('2024-01-14T09:00:00Z'),
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-14T09:00:00Z'),
  } as User,

  manager: {
    id: 'user-manager-3',
    email: 'manager@test.com',
    full_name: 'Manager User',
    phone: '+6281234567892',
    profile_photo_url: null,
    is_active: true,
    occupation_id: 'occ-manager',
    password_hash: '$2b$10$hashedpassword',
    last_login_at: new Date('2024-01-15T08:30:00Z'),
    created_at: new Date('2024-01-02T00:00:00Z'),
    updated_at: new Date('2024-01-15T08:30:00Z'),
  } as User,

  inspector: {
    id: 'user-inspector-4',
    email: 'inspector@test.com',
    full_name: 'Inspector User',
    phone: '+6281234567893',
    profile_photo_url: null,
    is_active: true,
    occupation_id: 'occ-cleaner',
    password_hash: '$2b$10$hashedpassword',
    last_login_at: new Date('2024-01-15T07:00:00Z'),
    created_at: new Date('2024-01-03T00:00:00Z'),
    updated_at: new Date('2024-01-15T07:00:00Z'),
  } as User,

  inactiveUser: {
    id: 'user-inactive-5',
    email: 'inactive@test.com',
    full_name: 'Inactive User',
    phone: null,
    profile_photo_url: null,
    is_active: false,
    occupation_id: null,
    password_hash: '$2b$10$hashedpassword',
    last_login_at: new Date('2023-12-01T00:00:00Z'),
    created_at: new Date('2023-11-01T00:00:00Z'),
    updated_at: new Date('2023-12-01T00:00:00Z'),
  } as User,

  newUser: {
    id: 'user-new-6',
    email: 'newuser@test.com',
    full_name: 'New User',
    phone: '+6281234567894',
    profile_photo_url: null,
    is_active: true,
    occupation_id: null,
    password_hash: null,
    last_login_at: null,
    created_at: new Date('2024-01-15T12:00:00Z'),
    updated_at: new Date('2024-01-15T12:00:00Z'),
  } as User,
};

export const mockUserRoles = {
  superAdminRole: {
    user_id: mockUsers.superAdmin.id,
    organization_id: 'org-test-1',
    role_id: 'role-super-admin',
    role_name: 'SUPER_ADMIN',
    role_level: 10,
    assigned_by: mockUsers.superAdmin.id,
    assigned_at: new Date('2024-01-01T00:00:00Z'),
  },

  adminRole: {
    user_id: mockUsers.admin.id,
    organization_id: 'org-test-1',
    role_id: 'role-admin',
    role_name: 'ADMIN',
    role_level: 8,
    assigned_by: mockUsers.superAdmin.id,
    assigned_at: new Date('2024-01-01T00:00:00Z'),
  },

  managerRole: {
    user_id: mockUsers.manager.id,
    organization_id: 'org-test-1',
    role_id: 'role-manager',
    role_name: 'MANAGER',
    role_level: 5,
    assigned_by: mockUsers.admin.id,
    assigned_at: new Date('2024-01-02T00:00:00Z'),
  },

  inspectorRole: {
    user_id: mockUsers.inspector.id,
    organization_id: 'org-test-1',
    role_id: 'role-inspector',
    role_name: 'INSPECTOR',
    role_level: 0,
    assigned_by: mockUsers.manager.id,
    assigned_at: new Date('2024-01-03T00:00:00Z'),
  },
};

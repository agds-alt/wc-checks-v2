/**
 * Organization Test Fixtures
 */

import type { Organization } from '@/domain/entities/Organization';

export const mockOrganizations = {
  mainOrg: {
    id: 'org-test-1',
    code: 'ORG-001',
    name: 'PT Bersih Sejahtera',
    description: 'Leading facilities management company',
    address: 'Jl. Sudirman Kav. 52-53, Jakarta Pusat',
    contact_phone: '+62215678900',
    contact_email: 'info@bersihsejahtera.com',
    logo_url: 'https://example.com/logos/bersih-sejahtera.png',
    is_active: true,
    created_by: 'user-super-admin-1',
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z'),
  } as Organization,

  hospitalOrg: {
    id: 'org-test-2',
    code: 'ORG-002',
    name: 'Healthcare Services Co',
    description: 'Healthcare facility management and cleaning services',
    address: 'Jl. Prof. Dr. Satrio No. 50, Jakarta Selatan',
    contact_phone: '+62215678901',
    contact_email: 'contact@healthcareservices.com',
    logo_url: 'https://example.com/logos/healthcare-services.png',
    is_active: true,
    created_by: 'user-super-admin-1',
    created_at: new Date('2024-01-02T00:00:00Z'),
    updated_at: new Date('2024-01-02T00:00:00Z'),
  } as Organization,

  retailOrg: {
    id: 'org-test-3',
    code: 'ORG-003',
    name: 'Retail Facility Management',
    description: 'Specialized in shopping mall and retail facility management',
    address: 'Jl. Thamrin No. 28-30, Jakarta Pusat',
    contact_phone: '+62215678902',
    contact_email: 'info@retailfm.com',
    logo_url: null,
    is_active: true,
    created_by: 'user-admin-2',
    created_at: new Date('2024-01-03T00:00:00Z'),
    updated_at: new Date('2024-01-03T00:00:00Z'),
  } as Organization,

  startupOrg: {
    id: 'org-test-4',
    code: 'ORG-004',
    name: 'CleanTech Solutions',
    description: 'Modern cleaning and facility tech solutions',
    address: 'BSD Green Office Park, Tangerang Selatan',
    contact_phone: '+62215678903',
    contact_email: 'hello@cleantech.id',
    logo_url: 'https://example.com/logos/cleantech.png',
    is_active: true,
    created_by: 'user-admin-2',
    created_at: new Date('2024-01-10T00:00:00Z'),
    updated_at: new Date('2024-01-10T00:00:00Z'),
  } as Organization,

  inactiveOrg: {
    id: 'org-inactive-1',
    code: 'ORG-099',
    name: 'Old Facilities Corp (Closed)',
    description: 'Defunct cleaning company',
    address: 'Jl. Veteran No. 1, Jakarta Pusat',
    contact_phone: null,
    contact_email: null,
    logo_url: null,
    is_active: false,
    created_by: 'user-super-admin-1',
    created_at: new Date('2020-01-01T00:00:00Z'),
    updated_at: new Date('2023-12-31T00:00:00Z'),
  } as Organization,

  newOrg: {
    id: 'org-new-1',
    code: 'ORG-NEW01',
    name: 'Fresh Start Services',
    description: null,
    address: 'Jl. Rasuna Said, Jakarta Selatan',
    contact_phone: '+62215678999',
    contact_email: 'info@freshstart.id',
    logo_url: null,
    is_active: true,
    created_by: 'user-admin-2',
    created_at: new Date('2024-01-15T00:00:00Z'),
    updated_at: new Date('2024-01-15T00:00:00Z'),
  } as Organization,
};

export const mockOrganizationsByCreator = {
  'user-super-admin-1': [
    mockOrganizations.mainOrg,
    mockOrganizations.hospitalOrg,
    mockOrganizations.inactiveOrg,
  ],
  'user-admin-2': [
    mockOrganizations.retailOrg,
    mockOrganizations.startupOrg,
    mockOrganizations.newOrg,
  ],
};

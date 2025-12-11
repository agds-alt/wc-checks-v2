/**
 * Building Test Fixtures
 */

import type { Building } from '@/domain/entities/Building';

export const mockBuildings = {
  mainOffice: {
    id: 'bld-main-office-1',
    code: 'BLD-001',
    name: 'Main Office Building',
    address: 'Jl. Sudirman No. 123, Jakarta Pusat',
    description: 'Main headquarters building with 10 floors',
    type: 'office',
    photo_url: 'https://example.com/buildings/main-office.jpg',
    organization_id: 'org-test-1',
    created_by: 'user-admin-2',
    is_active: true,
    created_at: new Date('2024-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z'),
  } as Building,

  warehouse: {
    id: 'bld-warehouse-2',
    code: 'BLD-002',
    name: 'Warehouse Complex',
    address: 'Jl. Raya Bekasi No. 456, Bekasi',
    description: 'Storage and distribution center',
    type: 'warehouse',
    photo_url: 'https://example.com/buildings/warehouse.jpg',
    organization_id: 'org-test-1',
    created_by: 'user-admin-2',
    is_active: true,
    created_at: new Date('2024-01-02T00:00:00Z'),
    updated_at: new Date('2024-01-02T00:00:00Z'),
  } as Building,

  shoppingMall: {
    id: 'bld-mall-3',
    code: 'BLD-003',
    name: 'Grand Plaza Mall',
    address: 'Jl. Gatot Subroto No. 789, Jakarta Selatan',
    description: '5-floor shopping mall with cinema and food court',
    type: 'commercial',
    photo_url: 'https://example.com/buildings/mall.jpg',
    organization_id: 'org-test-1',
    created_by: 'user-admin-2',
    is_active: true,
    created_at: new Date('2024-01-03T00:00:00Z'),
    updated_at: new Date('2024-01-03T00:00:00Z'),
  } as Building,

  apartment: {
    id: 'bld-apt-4',
    code: 'BLD-004',
    name: 'Green Valley Apartments',
    address: 'Jl. TB Simatupang No. 100, Jakarta Selatan',
    description: '25-floor residential apartment complex',
    type: 'residential',
    photo_url: null,
    organization_id: 'org-test-1',
    created_by: 'user-manager-3',
    is_active: true,
    created_at: new Date('2024-01-04T00:00:00Z'),
    updated_at: new Date('2024-01-04T00:00:00Z'),
  } as Building,

  hospital: {
    id: 'bld-hospital-5',
    code: 'BLD-005',
    name: 'City General Hospital',
    address: 'Jl. Prof. Dr. Satrio No. 200, Jakarta Selatan',
    description: 'Full-service hospital with emergency center',
    type: 'healthcare',
    photo_url: 'https://example.com/buildings/hospital.jpg',
    organization_id: 'org-test-2',
    created_by: 'user-admin-2',
    is_active: true,
    created_at: new Date('2024-01-05T00:00:00Z'),
    updated_at: new Date('2024-01-05T00:00:00Z'),
  } as Building,

  inactiveBuilding: {
    id: 'bld-inactive-6',
    code: 'BLD-006',
    name: 'Old Factory',
    address: 'Jl. Industri No. 50, Tangerang',
    description: 'Decommissioned factory building',
    type: 'industrial',
    photo_url: null,
    organization_id: 'org-test-1',
    created_by: 'user-admin-2',
    is_active: false,
    created_at: new Date('2023-01-01T00:00:00Z'),
    updated_at: new Date('2024-01-01T00:00:00Z'),
  } as Building,

  newBuilding: {
    id: 'bld-new-7',
    code: 'BLD-007',
    name: 'Tech Park',
    address: 'Jl. BSD No. 300, Tangerang Selatan',
    description: null,
    type: 'office',
    photo_url: null,
    organization_id: 'org-test-1',
    created_by: 'user-admin-2',
    is_active: true,
    created_at: new Date('2024-01-15T00:00:00Z'),
    updated_at: new Date('2024-01-15T00:00:00Z'),
  } as Building,
};

export const mockBuildingTypes = [
  'office',
  'commercial',
  'residential',
  'industrial',
  'healthcare',
  'warehouse',
  'educational',
  'hospitality',
];

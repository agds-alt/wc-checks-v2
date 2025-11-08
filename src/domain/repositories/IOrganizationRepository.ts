// Repository Interface: Organization
import { Organization, CreateOrganizationInput, UpdateOrganizationInput } from '../entities/Organization';

export interface IOrganizationRepository {
  findById(id: string): Promise<Organization | null>;
  findByCreator(creatorId: string): Promise<Organization[]>;
  create(input: CreateOrganizationInput): Promise<Organization>;
  update(id: string, input: UpdateOrganizationInput): Promise<Organization>;
  delete(id: string): Promise<void>;
  list(limit?: number, offset?: number): Promise<Organization[]>;
}

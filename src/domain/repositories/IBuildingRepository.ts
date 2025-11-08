// Repository Interface: Building
import { Building, CreateBuildingInput, UpdateBuildingInput } from '../entities/Building';

export interface IBuildingRepository {
  findById(id: string): Promise<Building | null>;
  findByOrganization(organizationId: string): Promise<Building[]>;
  create(input: CreateBuildingInput): Promise<Building>;
  update(id: string, input: UpdateBuildingInput): Promise<Building>;
  delete(id: string): Promise<void>;
  list(limit?: number, offset?: number): Promise<Building[]>;
}

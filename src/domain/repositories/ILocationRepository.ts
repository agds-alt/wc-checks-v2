// Repository Interface: Location
import { Location, CreateLocationInput, UpdateLocationInput } from '../entities/Location';

export interface ILocationRepository {
  findById(id: string): Promise<Location | null>;
  findByQRCode(qrCode: string): Promise<Location | null>;
  findByBuilding(buildingId: string): Promise<Location[]>;
  create(input: CreateLocationInput): Promise<Location>;
  update(id: string, input: UpdateLocationInput): Promise<Location>;
  delete(id: string): Promise<void>;
  list(limit?: number, offset?: number): Promise<Location[]>;
}

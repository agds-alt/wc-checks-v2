// Repository Interface: Inspection
import { Inspection, CreateInspectionInput, UpdateInspectionInput } from '../entities/Inspection';
import { InspectionComponent } from '../../types/inspection.types';

export interface IInspectionRepository {
  findById(id: string): Promise<Inspection | null>;
  findByLocation(locationId: string, limit?: number): Promise<Inspection[]>;
  findByInspector(inspectorId: string, limit?: number): Promise<Inspection[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Inspection[]>;
  create(input: CreateInspectionInput): Promise<Inspection>;
  update(id: string, input: UpdateInspectionInput): Promise<Inspection>;
  delete(id: string): Promise<void>;
  getComponents(inspectionId: string): Promise<InspectionComponent[]>;
  list(limit?: number, offset?: number): Promise<Inspection[]>;
}

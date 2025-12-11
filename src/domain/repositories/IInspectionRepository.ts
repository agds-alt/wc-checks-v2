// Repository Interface: Inspection
import { Inspection, CreateInspectionInput, UpdateInspectionInput } from '../entities/Inspection';

// Type for inspection component database records
export interface InspectionComponentRecord {
  id: string;
  inspection_id: string;
  component_name: string;
  rating: number;
  notes: string | null;
  created_at: string;
}

export interface IInspectionRepository {
  findById(id: string): Promise<Inspection | null>;
  findByLocation(locationId: string, limit?: number): Promise<Inspection[]>;
  findByInspector(inspectorId: string, limit?: number): Promise<Inspection[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Inspection[]>;
  create(input: CreateInspectionInput): Promise<Inspection>;
  update(id: string, input: UpdateInspectionInput): Promise<Inspection>;
  delete(id: string): Promise<void>;
  getComponents(inspectionId: string): Promise<InspectionComponentRecord[]>;
  list(limit?: number, offset?: number): Promise<Inspection[]>;
}

// Repository Interface: User
import { User, CreateUserInput, UpdateUserInput } from '../entities/User';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByOrganization(organizationId: string): Promise<User[]>;
  create(input: CreateUserInput): Promise<User>;
  update(id: string, input: UpdateUserInput): Promise<User>;
  delete(id: string): Promise<void>;
  list(limit?: number, offset?: number): Promise<User[]>;
}

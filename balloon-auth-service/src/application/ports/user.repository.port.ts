import { User } from "../../domain/user/entities/user";

export interface UserRepositoryPort {

  findByEmail(email: string): Promise<User | null>;

  save(user: User): Promise<void>;

  delete(user: User): Promise<void>;

  findByIdForUpdate(id: string): Promise<User | null>;

  findById(id: string): Promise<User | null>;
  
}
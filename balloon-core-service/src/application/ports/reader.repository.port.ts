import { Reader } from "../../domain/reader/entities/reader";

export interface ReaderRepositoryPort {

  upsert(reader: Reader): Promise<void>;

  findByUserId(userId: string): Promise<Reader | null>;
  
}
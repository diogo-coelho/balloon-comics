import { Reader } from "../../domain/reader.repository.port.ts";

export interface ReaderRepositoryPort {

  upsert(reader: Reader): Promise<void>;

  findByUserId(userId: string): Promise<Reader | null>;
  
}
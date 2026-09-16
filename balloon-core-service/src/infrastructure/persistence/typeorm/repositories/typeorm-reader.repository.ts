import { Repository } from "typeorm";
import { ReaderRepositoryPort } from "../../../../application/ports/reader.repository.port";
import { Reader } from "../../../../domain/reader/entities/reader";
import { ReaderOrmEntity } from "../entities/reader.orm-entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";

@Injectable()
export class TypeOrmReaderRepository implements ReaderRepositoryPort {

  constructor(
    @InjectRepository(ReaderOrmEntity)
    private readonly readerRepository: Repository<ReaderOrmEntity>
  ){}
  
  upsert(reader: Reader): Promise<void> {
    throw new Error("Method not implemented.");
  }

  findByUserId(userId: string): Promise<Reader | null> {
    throw new Error("Method not implemented.");
  }

}
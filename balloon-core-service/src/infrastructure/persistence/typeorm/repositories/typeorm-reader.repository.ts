import { Repository } from "typeorm";
import { ReaderRepositoryPort } from "../../../../application/ports/reader.repository.port";
import { Reader } from "../../../../domain/reader/entities/reader";
import { ReaderOrmEntity } from "../entities/reader.orm-entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { ReaderOrmMapper } from "../mappers/reader.orm-mapper";

@Injectable()
export class TypeOrmReaderRepository implements ReaderRepositoryPort {

  constructor(
    @InjectRepository(ReaderOrmEntity)
    private readonly readerRepository: Repository<ReaderOrmEntity>
  ){}
  
  async upsert(reader: Reader): Promise<void> {
    await this.readerRepository.upsert(
      {
        userId: reader.userId,
        email: reader.email,
        username: reader.username,
        name: reader.name,
        updatedAt: reader.updatedAt,
      },
      {
        conflictPaths: ['userId'],
      },
    );
  }

  async findByUserId(userId: string): Promise<Reader | null> {
    const entity = await this.readerRepository.findOneBy({ userId });
    if (!entity) return null;

    return entity
    ? ReaderOrmMapper.toDomain(entity)
    : null;
  }

  async synchronizeUserData(input: { userId: string; username: string; email: string; }): Promise<void> {
    await this.readerRepository.update({ userId: input.userId },
      {
        username: input.username,
        email: input.email,
        updatedAt: new Date(),
      },
    );
  }
  
  async deleteByUserId(userId: string): Promise<void> {
    await this.readerRepository.delete({ userId });
  }

  async updateImageUrl(userId: string, imageUrl: string): Promise<void> {
    await this.readerRepository.update({ userId },
      {
        imageUrl,
        updatedAt: new Date(),
      },
    );
  }

}
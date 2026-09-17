import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { AgeVerificationRepositoryPort } from "../../../../application/ports/age-verification.repository.port";
import { AgeVerification } from "../../../../domain/age-verification/entities/age-verification";
import { AgeVerificationOrmEntity } from "../entities/age-verification.orm-entity";
import { AgeVerificationOrmMapper } from "../mappers/age-verification.orm-mapper";
import { ReaderOrmEntity } from "../entities/reader.orm-entity";

@Injectable()
export class TypeOrmAgeVerificationRepository implements AgeVerificationRepositoryPort {

  constructor(
    @InjectRepository(AgeVerificationOrmEntity)
    private readonly repository: Repository<AgeVerificationOrmEntity>
  ) {}

  async findByReaderId(readerId: string): Promise<AgeVerification | null> {
    const entity = await this.repository.findOneBy({ reader: { id: readerId } });

    return entity
      ? AgeVerificationOrmMapper.toDomain(entity)
      : null;
  }
  
  async save(ageVerification: AgeVerification): Promise<AgeVerification> {
    const entity = new AgeVerificationOrmEntity();
    entity.id = ageVerification.id;
    entity.reader = { id: ageVerification.readerId } as ReaderOrmEntity;
    entity.dateOfBirth = ageVerification.dateOfBirth;
    entity.hasLegalAge = ageVerification.hasLegalAge;
    entity.createdAt = ageVerification.createdAt;
    entity.updatedAt = ageVerification.updatedAt;
    await this.repository.save(entity);

    return ageVerification;
  }
  
}
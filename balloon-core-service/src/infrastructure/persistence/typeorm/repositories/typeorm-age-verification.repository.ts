import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { AgeVerificationRepositoryPort } from "../../../../application/ports/age-verification.repository.port";
import { AgeVerification } from "../../../../domain/age-verification/entities/age-verification";
import { AgeVerificationOrmEntity } from "../entities/age-verification.orm-entity";
import { AgeVerificationOrmMapper } from "../mappers/age-verification.orm-mapper";

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
  
  async upsert(ageVerification: AgeVerification): Promise<void> {
    await this.repository.upsert({ 
        reader: { id: ageVerification.readerId },
        dateOfBirth: ageVerification.dateOfBirth,
        hasLegalAge: ageVerification.hasLegalAge,
        updatedAt: ageVerification.updatedAt,
      },
      {
        conflictPaths: ['readerId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );
  }
  
}
import { AgeVerification } from "../../../../domain/age-verification/entities/age-verification";
import { AgeVerificationOrmEntity } from "../entities/age-verification.orm-entity";

export class AgeVerificationOrmMapper {

  static toDomain(entity: AgeVerificationOrmEntity): AgeVerification {
    return new AgeVerification(
      entity.id,
      entity.reader.id,
      entity.dateOfBirth,
      entity.hasLegalAge,
      entity.createdAt,
      entity.updatedAt
    );
  }

}
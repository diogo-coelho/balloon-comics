import { ResponseAgeVerificationDto } from "../dtos/response/response-age-verification.dto";
import { AgeVerificationEntity } from "../entities/age-verification.entity";

export class AgeVerificationMapper {  

  toModelFromEntity(ageVerification: AgeVerificationEntity, related: boolean): ResponseAgeVerificationDto {
    return {
      id: ageVerification.id,
      readerId: related ? ageVerification.reader.id : undefined,
      hasLegalAge: ageVerification.hasLegalAge,
      dateOfBirth: ageVerification.dateOfBirth,
      createdAt: ageVerification.createdAt,
      updatedAt: ageVerification.updatedAt,
    };
  }

}
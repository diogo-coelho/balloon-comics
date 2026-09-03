import { ResponseAgeVerificationDto } from "../dtos/response/response-age-verification.dto";
import { AgeVerificationEntity } from "../entities/age-verification.entity";

export class AgeVerificationMapper {  

  toModelFromEntity(ageVerification: AgeVerificationEntity): ResponseAgeVerificationDto {
    return {
      id: ageVerification.id,
      readerId: ageVerification.reader.id,
      hasLegalAge: ageVerification.hasLegalAge,
      dateOfBirth: ageVerification.dateOfBirth,
      createdAt: ageVerification.createdAt,
      updatedAt: ageVerification.updatedAt,
    };
  }

}
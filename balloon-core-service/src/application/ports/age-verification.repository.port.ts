import { AgeVerification } from "../../domain/age-verification/entities/age-verification";

export interface AgeVerificationRepositoryPort {

  findByReaderId(readerId: string): Promise<AgeVerification | null>;

  upsert(ageVerification: AgeVerification): Promise<void>;

}
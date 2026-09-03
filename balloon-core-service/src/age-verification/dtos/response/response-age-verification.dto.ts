export class ResponseAgeVerificationDto {
  id!: string;
  readerId?: string;
  hasLegalAge!: boolean;
  dateOfBirth!: Date;
  createdAt!: Date;
  updatedAt!: Date;
}
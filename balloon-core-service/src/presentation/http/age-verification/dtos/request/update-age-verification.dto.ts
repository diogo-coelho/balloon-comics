import { IsDateString } from 'class-validator';

export class UpdateAgeVerificationDto {
  @IsDateString()
  dateOfBirth!: string;
}

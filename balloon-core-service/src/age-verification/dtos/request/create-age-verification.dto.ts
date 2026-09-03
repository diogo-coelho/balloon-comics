import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty } from "class-validator";

export class CreateAgeVerificationDto {
  @IsNotEmpty()
  @Type(() => Date)
  @IsDateString()
  readonly dateOfBirth!: string;
}
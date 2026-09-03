import { IsArray, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { CreateAgeVerificationDto } from '../../../age-verification/dtos/request/create-age-verification.dto';
import { CreateSocialMediaLinkDto } from '../../../social-media-link/dtos/request/create-social-media-link.dto';
export class UploadReaderDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  readonly name!: string;

  @IsOptional()
  @IsString()
  @Matches(/\S/, { message: 'Descrição inválida' })
  readonly description?: string;

  @IsOptional()
  readonly ageVerification?: CreateAgeVerificationDto;

  @IsOptional()
  @IsArray()
  readonly socialMediaLinks?: CreateSocialMediaLinkDto[];
}

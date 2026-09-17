import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateAgeVerificationDto } from '../../../age-verification/dtos/request/update-age-verification.dto';
import { UpdateSocialMediaLinkDto } from '../../../social-media-link/dtos/request/update-social-media-link.dto';

export class UpdateReaderDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  readonly name!: string;

  @IsOptional()
  @IsString()
  @Matches(/\S/, { message: 'Descrição inválida' })
  readonly description?: string;

  @IsOptional()
  readonly ageVerification?: UpdateAgeVerificationDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSocialMediaLinkDto)
  readonly socialMediaLinks?: UpdateSocialMediaLinkDto[];
}

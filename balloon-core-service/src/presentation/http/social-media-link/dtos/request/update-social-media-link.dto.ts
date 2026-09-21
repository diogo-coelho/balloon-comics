import { IsEnum, IsUrl } from 'class-validator';
import { SocialMediaTypeEnum } from '../../../../../domain/social-media-link/enums/social-media-type.enum';

export class UpdateSocialMediaLinkDto {
  @IsEnum(SocialMediaTypeEnum)
  name!: SocialMediaTypeEnum;

  @IsUrl()
  url!: string;
}

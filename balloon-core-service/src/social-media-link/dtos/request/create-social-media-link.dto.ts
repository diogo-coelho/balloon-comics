import { IsNotEmpty, IsString, IsUrl } from "class-validator";
import { SocialMediaTypeEnum } from "../../enums/social-media-type.enum";

export class CreateSocialMediaLinkDto {
  @IsString()
  @IsNotEmpty()
  readonly name!: SocialMediaTypeEnum;
  
  @IsString()
  @IsNotEmpty()
  @IsUrl(
    { require_protocol: false },
    { message: 'URL da rede social inválida' },
  )
  readonly url!: string;
}
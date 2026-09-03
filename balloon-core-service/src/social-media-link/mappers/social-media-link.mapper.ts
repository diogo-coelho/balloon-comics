import { SocialMediaLinkEntity } from "../entities/social-media-link.entity";
import { ResponseSocialMediaLinkDto } from "../dtos/response/response-social-media-link.dto";

export class SocialMediaLinkMapper {
  
  toModelFromEntity(entity: SocialMediaLinkEntity): ResponseSocialMediaLinkDto {
    return {
      id: entity.id,
      readerId: entity.reader.id,
      name: entity.name,
      url: entity.url,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }

}
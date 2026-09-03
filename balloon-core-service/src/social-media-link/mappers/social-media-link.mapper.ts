import { SocialMediaLinkEntity } from "../entities/social-media-link.entity";
import { ResponseSocialMediaLinkDto } from "../dtos/response/response-social-media-link.dto";

export class SocialMediaLinkMapper {
  
  toModelFromEntity(entity: SocialMediaLinkEntity, related: boolean): ResponseSocialMediaLinkDto {
    return {
      id: entity.id,
      readerId: related ? entity.reader.id : undefined,
      name: entity.name,
      url: entity.url,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }

}
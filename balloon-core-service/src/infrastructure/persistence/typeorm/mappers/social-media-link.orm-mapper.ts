import { SocialMediaLink } from "../../../../domain/social-media-link/entities/social-media-link";
import { SocialMediaTypeEnum } from "../../../../domain/social-media-link/enums/social-media-type.enum";
import { SocialMediaLinkOrmEntity } from "../entities/social-media-link.orm-entity";

export class SocialMediaLinkOrmMapper {

  static toDomain(entity: SocialMediaLinkOrmEntity): SocialMediaLink {
    return new SocialMediaLink(
      entity.id,
      entity.reader.id,
      entity.name as SocialMediaTypeEnum,
      entity.url,
      entity.createdAt,
      entity.updatedAt,
    );
  }

}
import { SocialMediaTypeEnum } from '../../domain/social-media-link/enums/social-media-type.enum';

export type SocialMediaLinkOutput = {
  id: string;
  name: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateSocialMediaLinkInput = {
  name: SocialMediaTypeEnum;
  url: string;
};

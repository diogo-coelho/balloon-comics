export type SocialMediaLinkOutput = {
  id: string;
  name: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UpdateSocialMediaLinkInput = { 
  name: SocialMediaTypeEnum;
  url: string;
}
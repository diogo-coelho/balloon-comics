export type GetReaderOutput = {
  id: string;
  email: string;
  username: string;
  name: string;
  imageUrl?: string;
  description?: string;
  ageVerification?: AgeVerificationOutput
  socialMediaLinks?: SocialMediaLinkOutput[];
};

export type UploadReaderImageOutput = {
  id: string;
  imageUrl: string;
};
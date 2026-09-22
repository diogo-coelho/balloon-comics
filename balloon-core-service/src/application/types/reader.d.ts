import type {
  AgeVerificationOutput,
  UpdateAgeVerificationInput,
} from './age-verification';
import type {
  SocialMediaLinkOutput,
  UpdateSocialMediaLinkInput,
} from './social-media-link';

export type GetReaderOutput = {
  id: string;
  email: string;
  username: string;
  name: string;
  imageUrl?: string;
  description?: string;
  ageVerification?: AgeVerificationOutput;
  socialMediaLinks?: SocialMediaLinkOutput[];
};

export type UploadReaderImageOutput = {
  id: string;
  imageUrl: string;
};

export type UpdateReaderInput = {
  userId: string;
  name: string;
  description?: string;
  ageVerification?: UpdateAgeVerificationInput;
  socialMediaLinks?: UpdateSocialMediaLinkInput[];
};

export type UpdateReaderOutput = {
  id: string;
  email: string;
  username: string;
  name: string;
  imageUrl?: string;
  description?: string;
  ageVerification?: AgeVerificationOutput;
  socialMediaLinks?: SocialMediaLinkOutput[];
  createdAt: Date;
  updateAt?: Date;
};

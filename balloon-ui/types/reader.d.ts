import { AgeVerificationData } from "./age-verification";
import { SocialMediaLinksData } from "./social-media-link";

export type ReaderData = {
  id: string;
  username: string;
  email: string;
  name?: string;
  imageUrl?: string;
  description?: string;
  ageVerification?: AgeVerificationData;
  socialMediaLinks: SocialMediaLinksData[];
  createdAt: Date;
  updatedAt: Date;
}
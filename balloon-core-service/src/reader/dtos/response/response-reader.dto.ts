import { ResponseAgeVerificationDto } from '../../../age-verification/dtos/response/response-age-verification.dto';
import { ResponseSocialMediaLinkDto } from '../../../social-media-link/dtos/response/response-social-media-link.dto';

export class ResponseReaderDto {
  message?: string;
  data?: {
    id?: string;
    email?: string;
    username?: string;
    name?: string;
    imageUrl?: string;
    description?: string;
    ageVerification?: ResponseAgeVerificationDto | undefined;
    socialMediaLinks?: ResponseSocialMediaLinkDto[] | undefined;
  };
  next?: string;
}

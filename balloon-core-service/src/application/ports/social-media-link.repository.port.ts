import { SocialMediaLink } from '../../domain/social-media-link/entities/social-media-link';

export interface SocialmediaLinkRepositoryPort {
  findByReaderId(readerId: string): Promise<SocialMediaLink[]>;

  findByReaderIdAndName(
    readerId: string,
    name: string,
  ): Promise<SocialMediaLink | null>;

  saveMany(links: SocialMediaLink[]): Promise<SocialMediaLink[]>;
}

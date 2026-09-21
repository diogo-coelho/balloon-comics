import ReaderNotFoundError from '../../../domain/reader/errors/reader-not-found.error';
import { AgeVerificationRepositoryPort } from '../../ports/age-verification.repository.port';
import { ReaderRepositoryPort } from '../../ports/reader.repository.port';
import { SocialmediaLinkRepositoryPort } from '../../ports/social-media-link.repository.port';
import { StoragePort } from '../../ports/storage.port';
import { GetReaderOutput } from '../../types/reader';

export class GetReaderUseCase {
  constructor(
    private readonly readers: ReaderRepositoryPort,
    private readonly ageVerification: AgeVerificationRepositoryPort,
    private readonly socialMediaLinks: SocialmediaLinkRepositoryPort,
    private readonly storage: StoragePort,
  ) {}

  async execute(userId: string): Promise<GetReaderOutput> {
    const reader = await this.readers.findByUserId(userId);

    if (!reader)
      throw new ReaderNotFoundError(`Leitor não encontrado: ${userId}`);

    const [ageVerification, socialMediaLinks] = await Promise.all([
      this.ageVerification.findByReaderId(reader.id),
      this.socialMediaLinks.findByReaderId(reader.id),
    ]);

    return {
      id: reader.id,
      email: reader.email,
      username: reader.username,
      name: reader.name,
      imageUrl: reader.imageUrl
        ? this.storage.getPublicUrl(reader.imageUrl)
        : undefined,
      description: reader.description ?? undefined,
      ageVerification: ageVerification
        ? {
            id: ageVerification.id,
            hasLegalAge: ageVerification.hasLegalAge,
            dateOfBirth: ageVerification.dateOfBirth,
            createdAt: ageVerification.createdAt,
            updatedAt: ageVerification.updatedAt,
          }
        : undefined,
      socialMediaLinks:
        socialMediaLinks.length > 0
          ? socialMediaLinks.map((link) => ({
              id: link.id,
              name: link.name,
              url: link.url,
              createdAt: link.createdAt,
              updatedAt: link.updatedAt,
            }))
          : undefined,
    };
  }
}

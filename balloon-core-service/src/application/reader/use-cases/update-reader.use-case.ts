import { AgeVerification } from '../../../domain/age-verification/entities/age-verification';
import ReaderNotFoundError from '../../../domain/reader/errors/reader-not-found.error';
import { SocialMediaLink } from '../../../domain/social-media-link/entities/social-media-link';
import { CoreUnitOfWorkPort } from '../../ports/core-unit-of-work.port';
import { StoragePort } from '../../ports/storage.port';
import { UpdateReaderInput, UpdateReaderOutput } from '../../types/reader';

export class UpdateReaderUseCase {
  constructor(
    private readonly unitOfWork: CoreUnitOfWorkPort,
    private readonly storage: StoragePort,
  ) {}

  async execute(input: UpdateReaderInput): Promise<UpdateReaderOutput> {
    return this.unitOfWork.execute(async (transaction) => {
      const reader = await transaction.readers.findByUserIdForUpdate(
        input.userId,
      );
      if (!reader)
        throw new ReaderNotFoundError(`Leitor não encontrado: ${input.userId}`);
      reader.updateProfile({
        name: input.name,
        description: input.description,
      });
      await transaction.readers.updateProfile(reader);

      let ageVerification: AgeVerification | null = null;
      if (input.ageVerification?.dateOfBirth) {
        ageVerification = await transaction.ageVerifications.findByReaderId(
          reader.id,
        );

        if (ageVerification) {
          ageVerification.updateDateOfBirth(
            new Date(input.ageVerification.dateOfBirth),
          );
        } else {
          ageVerification = AgeVerification.create({
            readerId: reader.id,
            dateOfBirth: new Date(input.ageVerification.dateOfBirth),
          });
        }

        await transaction.ageVerifications.save(ageVerification);
      }

      let updatedSocialMediaLinks;
      if (input.socialMediaLinks?.length) {
        const currentLinks = await transaction.socialMediaLinks.findByReaderId(
          reader.id,
        );
        const linksByName = new Map(
          currentLinks.map((link) => [link.name, link]),
        );

        updatedSocialMediaLinks = input.socialMediaLinks.map((inputLink) => {
          const existing = linksByName.get(inputLink.name);
          if (existing) {
            existing.updateUrl(inputLink.url);
            return existing;
          }

          return SocialMediaLink.create({
            readerId: reader.id,
            name: inputLink.name,
            url: inputLink.url,
          });
        });

        await transaction.socialMediaLinks.saveMany(updatedSocialMediaLinks);
      }

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
        socialMediaLinks: updatedSocialMediaLinks?.map(
          (link: SocialMediaLink) => ({
            id: link.id,
            name: link.name,
            url: link.url,
            createdAt: link.createdAt,
            updatedAt: link.updatedAt,
          }),
        ),
        createdAt: reader.createdAt,
        updatedAt: reader.updatedAt,
      };
    });
  }
}

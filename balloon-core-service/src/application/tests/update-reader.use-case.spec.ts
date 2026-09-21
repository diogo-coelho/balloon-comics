import { UpdateReaderUseCase } from '../reader/use-cases/update-reader.use-case';
import { Reader } from '../../domain/reader/entities/reader';
import ReaderNotFoundError from '../../domain/reader/errors/reader-not-found.error';
import { SocialMediaTypeEnum } from '../../domain/social-media-link/enums/social-media-type.enum';

describe('UpdateReaderUseCase', () => {
  it('deve atualizar perfil, verificar idade e links sociais existentes e novos', async () => {
    const currentDate = new Date('2026-09-17T00:00:00.000Z');
    const reader = new Reader(
      'reader-id',
      'user-id',
      'ana@example.com',
      'ana',
      'Ana',
      null,
      'bio antiga',
      currentDate,
      currentDate,
    );

    const transaction = {
      readers: {
        findByUserIdForUpdate: jest.fn().mockResolvedValue(reader),
        updateProfile: jest.fn().mockResolvedValue(undefined),
      },
      ageVerifications: {
        findByReaderId: jest.fn().mockResolvedValue(null),
        save: jest.fn().mockImplementation(async (item) => item),
      },
      socialMediaLinks: {
        findByReaderId: jest.fn().mockResolvedValue([
          {
            id: 'link-1',
            name: SocialMediaTypeEnum.INSTAGRAM,
            url: 'https://instagram.com/old',
            createdAt: currentDate,
            updatedAt: currentDate,
            updateUrl: jest.fn(),
          },
        ]),
        saveMany: jest.fn().mockImplementation(async (links) => links),
      },
    };

    const unitOfWork = {
      execute: jest.fn(async (operation) => operation(transaction)),
    };
    const storage = {
      getPublicUrl: jest
        .fn()
        .mockReturnValue('https://cdn.example.com/avatar.png'),
    };

    const result = await new UpdateReaderUseCase(
      unitOfWork,
      storage as any,
    ).execute({
      userId: 'user-id',
      name: 'Ana Souza',
      description: 'Nova bio',
      ageVerification: { dateOfBirth: '2000-05-10' },
      socialMediaLinks: [
        {
          name: SocialMediaTypeEnum.INSTAGRAM,
          url: 'https://instagram.com/new',
        },
        { name: SocialMediaTypeEnum.WEBSITE, url: 'https://ana.dev' },
      ],
    });

    expect(transaction.readers.updateProfile).toHaveBeenCalled();
    expect(transaction.ageVerifications.save).toHaveBeenCalled();
    expect(transaction.socialMediaLinks.saveMany).toHaveBeenCalledTimes(1);
    expect(result.name).toBe('Ana Souza');
    expect(result.description).toBe('Nova bio');
    expect(result.ageVerification).toBeDefined();
    expect(result.socialMediaLinks).toHaveLength(2);
  });

  it('deve rejeitar quando o leitor não existe', async () => {
    const unitOfWork = {
      execute: jest.fn(async (operation) =>
        operation({
          readers: { findByUserIdForUpdate: jest.fn().mockResolvedValue(null) },
        }),
      ),
    };

    await expect(
      new UpdateReaderUseCase(
        unitOfWork as any,
        { getPublicUrl: jest.fn() } as any,
      ).execute({
        userId: 'missing-user',
        name: 'Ana',
      }),
    ).rejects.toBeInstanceOf(ReaderNotFoundError);
  });
});

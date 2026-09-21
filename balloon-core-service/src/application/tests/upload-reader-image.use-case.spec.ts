import { UploadReaderImageUseCase } from '../reader/use-cases/upload-reader-image.use-case';
import ReaderNotFoundError from '../../domain/reader/errors/reader-not-found.error';
import { Reader } from '../../domain/reader/entities/reader';

describe('UploadReaderImageUseCase', () => {
  it('deve processar imagem, salvar e retornar a URL pública', async () => {
    const reader = new Reader(
      'reader-id',
      'user-id',
      'ana@example.com',
      'ana',
      'Ana',
      null,
      null,
      new Date('2025-01-01T00:00:00.000Z'),
      new Date('2025-01-01T00:00:00.000Z'),
    );

    const readers = {
      findByUserId: jest.fn().mockResolvedValue(reader),
      updateImageUrl: jest.fn().mockResolvedValue(undefined),
    };
    const imageProcessor = {
      process: jest.fn().mockResolvedValue({
        originalName: 'avatar.webp',
        mimeType: 'image/webp',
        size: 200,
        buffer: Buffer.from('processed'),
      }),
    };
    const storage = {
      uploadFile: jest.fn().mockResolvedValue('readers/avatar.webp'),
      getPublicUrl: jest
        .fn()
        .mockReturnValue('https://cdn.example.com/readers/avatar.webp'),
    };

    const result = await new UploadReaderImageUseCase(
      readers as any,
      imageProcessor,
      storage,
    ).execute({
      userId: 'user-id',
      file: {
        originalName: 'avatar.png',
        mimeType: 'image/png',
        size: 120,
        buffer: Buffer.from('raw'),
      },
    });

    expect(imageProcessor.process).toHaveBeenCalled();
    expect(storage.uploadFile).toHaveBeenCalledWith(
      expect.objectContaining({ originalName: 'avatar.webp' }),
      'readers',
    );
    expect(readers.updateImageUrl).toHaveBeenCalledWith(
      'user-id',
      'readers/avatar.webp',
    );
    expect(result).toEqual({
      id: 'reader-id',
      imageUrl: 'https://cdn.example.com/readers/avatar.webp',
    });
  });

  it('deve rejeitar quando o leitor não existe', async () => {
    await expect(
      new UploadReaderImageUseCase(
        {
          findByUserId: jest.fn().mockResolvedValue(null),
          updateImageUrl: jest.fn(),
        } as any,
        { process: jest.fn() } as any,
        { uploadFile: jest.fn(), getPublicUrl: jest.fn() } as any,
      ).execute({
        userId: 'missing-user',
        file: {
          originalName: 'avatar.png',
          mimeType: 'image/png',
          size: 10,
          buffer: Buffer.from('x'),
        },
      }),
    ).rejects.toBeInstanceOf(ReaderNotFoundError);
  });
});

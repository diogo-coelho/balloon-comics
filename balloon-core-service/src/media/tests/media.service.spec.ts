import { MediaService } from '../media.service';
import { ImageType } from '../enums/image-type.enum';
import { ImageFormat } from '../enums/image-format.enum';
import { ImageProcessFailedException } from '../error/image-process-failed.exception';
import { IMAGE_PROFILES } from '../interfaces/image-profile.interface';

const rotateMock = jest.fn();
const resizeMock = jest.fn();
const webpMock = jest.fn();
const jpegMock = jest.fn();
const pngMock = jest.fn();
const tiffMock = jest.fn();
const toBufferMock = jest.fn();

jest.mock('sharp', () => {
  return jest.fn().mockImplementation(() => {
    const chain = {
      rotate: rotateMock.mockReturnThis(),
      resize: resizeMock.mockReturnThis(),
      webp: webpMock.mockReturnThis(),
      jpeg: jpegMock.mockReturnThis(),
      png: pngMock.mockReturnThis(),
      tiff: tiffMock.mockReturnThis(),
      toBuffer: toBufferMock,
    };
    return chain;
  });
});

describe('MediaService', () => {
  let service: MediaService;
  const originalUserAvatarProfile = { ...IMAGE_PROFILES[ImageType.USER_AVATAR] };

  const file = {
    originalname: 'avatar.png',
    buffer: Buffer.from('original-content'),
    mimetype: 'image/png',
    size: 100,
  } as Express.Multer.File;

  beforeEach(() => {
    service = new MediaService();
  });

  afterEach(() => {
    jest.clearAllMocks();
    IMAGE_PROFILES[ImageType.USER_AVATAR] = { ...originalUserAvatarProfile };
  });

  describe('processImage', () => {
    it('deve processar a imagem de acordo com o perfil do tipo informado', async () => {
      const processedBuffer = Buffer.from('processed-content');
      toBufferMock.mockResolvedValue(processedBuffer);

      const result = await service.processImage(file, ImageType.USER_AVATAR);

      expect(resizeMock).toHaveBeenCalledWith(150, 150, {
        fit: 'cover',
        withoutEnlargement: true,
      });
      expect(webpMock).toHaveBeenCalledWith({ quality: 80 });
      expect(result).toEqual({
        ...file,
        originalname: 'avatar.webp',
        buffer: processedBuffer,
        mimetype: 'webp',
        size: processedBuffer.length,
      });
    });

    it.each([
      [ImageFormat.JPEG, jpegMock],
      [ImageFormat.JPG, jpegMock],
      [ImageFormat.PNG, pngMock],
      [ImageFormat.TIFF, tiffMock],
    ])('deve aplicar o encoder correto para o formato %s', async (format, encoderMock) => {
      IMAGE_PROFILES[ImageType.USER_AVATAR] = {
        ...originalUserAvatarProfile,
        format,
      };
      toBufferMock.mockResolvedValue(Buffer.from('processed'));

      await service.processImage(file, ImageType.USER_AVATAR);

      expect(encoderMock).toHaveBeenCalledWith({ quality: 80 });
    });

    it('deve lançar ImageProcessFailedException quando o formato não for suportado', async () => {
      IMAGE_PROFILES[ImageType.USER_AVATAR] = {
        ...originalUserAvatarProfile,
        format: 'gif' as any,
      };

      await expect(
        service.processImage(file, ImageType.USER_AVATAR),
      ).rejects.toThrow(ImageProcessFailedException);
    });

    it('deve lançar ImageProcessFailedException quando o processamento falhar', async () => {
      toBufferMock.mockRejectedValue(new Error('falha ao processar'));

      await expect(
        service.processImage(file, ImageType.USER_AVATAR),
      ).rejects.toThrow(ImageProcessFailedException);
    });
  });
});

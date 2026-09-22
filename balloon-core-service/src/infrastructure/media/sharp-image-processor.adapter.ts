import sharp from 'sharp';
import { ImageProcessorPort } from '../../application/ports/image.processor.port';
import { FileData } from '../../application/types/file';
import { UnsupportedImageError } from './errors/unsupported-image.error';
import { ImageProfile } from '../../domain/types/file';

export class SharpImageProcessorAdapter implements ImageProcessorPort {
  async process(file: FileData, profile: ImageProfile): Promise<FileData> {
    let image = sharp(file.buffer).rotate();

    if (profile.width || profile.height) {
      image = image.resize(profile.width, profile.height, {
        fit: profile.fit ?? 'cover',
        withoutEnlargement: true,
      });
    }

    switch (profile.format) {
      case 'jpeg':
      case 'jpg':
        image = image.jpeg({ quality: profile.quality });
        break;

      case 'webp':
        image = image.webp({ quality: profile.quality });
        break;

      case 'png':
        image = image.png({ quality: profile.quality });
        break;

      case 'tiff':
        image = image.tiff({ quality: profile.quality });
        break;

      default:
        throw new UnsupportedImageError(profile.format);
    }

    const processedBuffer = await image.toBuffer();
    const filename = file.originalName.split('.').slice(0, -1).join('.');

    return {
      originalName: `${filename}.${profile.format}`,
      mimeType: `image/${profile.format}`,
      size: processedBuffer.length,
      buffer: processedBuffer,
    };
  }
}

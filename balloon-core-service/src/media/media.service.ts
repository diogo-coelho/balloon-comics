import { Injectable } from "@nestjs/common";
import sharp from 'sharp';
import { ImageType } from "./enums/image-type.enum";
import { IMAGE_PROFILES } from "./interfaces/image-profile.interface";
import { ImageProcessFailedException } from "./error/image-process-failed.exception";

@Injectable()
export class MediaService {

  async processImage(file: Express.Multer.File, type: ImageType): Promise<Express.Multer.File> {
    try {
      const profile = IMAGE_PROFILES[type];
      let image = sharp(file.buffer).rotate();

      if (profile.width || profile.height) {
        image = image.resize(
          profile.width, 
          profile.height, {
          fit: profile.fit || 'cover',
          withoutEnlargement: true,
        });
      }

      switch (profile.format) {
        case 'jpeg':
        case 'jpg':
          image = image.jpeg({
            quality: profile.quality || 80,
          });
          break;
        case 'webp':
          image = image.webp({
            quality: profile.quality || 80,
          });
          break;
        case 'png':
          image = image.png({
            quality: profile.quality || 80,
          });
          break;
        case 'tiff':
          image = image.tiff({
            quality: profile.quality || 80,
          });
          break;
        default:
          throw new ImageProcessFailedException(`Unsupported image format: ${profile.format}`);
      }
      
      const processedBuffer = await image.toBuffer();
      
      return {
        ...file,
        originalname: file.originalname.split('.').shift() + '.' + profile.format,
        buffer: processedBuffer,
        mimetype: profile.format,
        size: processedBuffer.length,
      };

    } catch (error: Error | unknown) {
      throw new ImageProcessFailedException(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

  }

}
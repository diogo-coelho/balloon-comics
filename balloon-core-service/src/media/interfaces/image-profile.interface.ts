import { ImageFormat } from '../enums/image-format.enum';
import { ImageType } from '../enums/image-type.enum';

export interface ImageProfile {
  width?: number;
  height?: number;
  quality: number;
  format: ImageFormat.WEBP | ImageFormat.JPEG | ImageFormat.PNG | ImageFormat.TIFF | ImageFormat.JPG; 
  fit?: 'cover' | 'inside';
}

export const IMAGE_PROFILES: Record<ImageType, ImageProfile> = {
  [ImageType.USER_AVATAR]: {
    width: 150,
    height: 150,
    quality: 80,
    format: ImageFormat.WEBP, 
    fit: 'cover',
  },

  [ImageType.COMIC_BANNER]: {
    width: 600,
    height: 900,
    quality: 80,
    format: ImageFormat.WEBP,
    fit: 'cover',
  },

  [ImageType.COMIC_THUMBNAIL]: {
    width: 300,
    height: 300,
    quality: 80,
    format: ImageFormat.WEBP,
    fit: 'cover',
  },

  [ImageType.COMIC_COVER]: {
    width: 500,
    height: 750,
    quality: 85,
    format: ImageFormat.WEBP,
    fit: 'inside',
  },

  [ImageType.COMIC_PAGE]: {
    width: 940,
    quality: 100,
    format: ImageFormat.WEBP,
    fit: 'inside',
  },
};
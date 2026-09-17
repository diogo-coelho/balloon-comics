import { ImageType } from "../../media/enums/image-type.enum";
import { ImageProfile } from "../types/file";

export const IMAGE_PROFILES: Record<ImageType, ImageProfile> = {
  [ImageType.USER_AVATAR]: {
    width: 150,
    height: 150,
    quality: 80,
    format: 'webp',
    fit: 'cover',
  },
  [ImageType.COMIC_BANNER]: {
    width: 600,
    height: 900,
    quality: 80,
    format: 'webp',
    fit: 'cover',
  },
  [ImageType.COMIC_THUMBNAIL]: {
    width: 300,
    height: 300,
    quality: 80,
    format: 'webp',
    fit: 'cover',
  },
  [ImageType.COMIC_COVER]: {
    width: 500,
    height: 750,
    quality: 85,
    format: 'webp',
    fit: 'inside',
  },
  [ImageType.COMIC_PAGE]: {
    width: 940,
    quality: 100,
    format: 'webp',
    fit: 'inside',
  },
};
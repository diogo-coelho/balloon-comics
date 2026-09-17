export type FileData = {
  originalName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
};

export type ImageProfile = {
  width?: number;
  height?: number;
  quality: number;
  format: ImageFormat;
  fit?: 'cover' | 'inside';
};

export type ImageFormat =
  | 'webp'
  | 'jpeg'
  | 'jpg'
  | 'png'
  | 'tiff';
export class UnsupportedImageError extends Error {
  constructor(imageFormat: string) {
    super(`Unsupported image format: ${imageFormat}`);
    this.name = 'UnsupportedImageError';
  }
}
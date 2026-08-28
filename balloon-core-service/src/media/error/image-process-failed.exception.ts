export class ImageProcessFailedException extends Error {
  private statusCode: number;

  constructor(message: string) {
    super();
    this.name = 'ImageProcessFailedException';
    this.cause = new Error(message);
    this.statusCode = 500;
  }

  static fromError(error: Error): ImageProcessFailedException {
    return new ImageProcessFailedException(error.message);
  }

  static fromMessage(message: string): ImageProcessFailedException {
    return new ImageProcessFailedException(message);
  }

  getStatusCode(): number {
    return this.statusCode;
  }
  
}

export abstract class StorageService {
  abstract uploadFile(file: Express.Multer.File, object: string);

  abstract getPublicUrl(key: string): string;

}
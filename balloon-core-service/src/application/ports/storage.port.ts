import { FileData } from "../types/file";

export interface StoragePort {

  getPublicUrl(key: string): string;

  uploadFile(file: FileData, object: string): Promise<string>;
  
}
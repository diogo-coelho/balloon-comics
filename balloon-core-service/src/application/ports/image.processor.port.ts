import { FileData, ImageProfile } from '../types/file';

export interface ImageProcessorPort {
  process(file: FileData, profile: ImageProfile): Promise<FileData>;
}

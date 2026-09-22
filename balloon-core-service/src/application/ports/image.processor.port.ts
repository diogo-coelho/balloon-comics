import { ImageProfile } from "../../domain/types/file";
import { FileData } from "../types/file";

export interface ImageProcessorPort {
  process(file: FileData, profile: ImageProfile): Promise<FileData>;
}

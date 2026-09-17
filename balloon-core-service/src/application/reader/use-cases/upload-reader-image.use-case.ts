import ReaderNotFoundError from "../../../domain/reader/errors/reader-not-found.error";
import { ImageTypeEnum } from "../../../domain/media/enums/image-type.enum";
import { IMAGE_PROFILES } from "../../../domain/media/image-profile";
import { ImageProcessorPort } from "../../ports/image.processor.port";
import { ReaderRepositoryPort } from "../../ports/reader.repository.port";
import { StoragePort } from "../../ports/storage.port";
import { FileData } from "../../types/file";
import { UploadReaderImageOutput } from "../../types/reader";

export class UploadReaderImageUseCase {

  constructor(
    private readonly readers: ReaderRepositoryPort,
    private readonly imageProcessor: ImageProcessorPort,
    private readonly storage: StoragePort,
  ) {}

  async execute(input: { userId: string; file: FileData }): Promise<UploadReaderImageOutput> {

    const reader = await this.readers.findByUserId(input.userId);

    if (!reader) throw new ReaderNotFoundError(`Leitor não encontrado: ${input.userId}`);
    
    const processedImage = await this.imageProcessor.process(
      input.file, 
      IMAGE_PROFILES[ImageTypeEnum.USER_AVATAR]
    );
    const key = await this.storage.uploadFile(processedImage, 'readers');
    await this.readers.updateImageUrl(input.userId, key);

    return {
      id: reader.id,
      imageUrl: this.storage.getPublicUrl(key),
    }

  }
}
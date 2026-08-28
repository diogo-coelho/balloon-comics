import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { MediaService } from '../media/media.service';

import { ImageType } from '../media/enums/image-type.enum';
import { ProcessedEventEntity } from './entities/processed-event.entity';
import { ReaderEntity } from './entities/reader.entity';
import { StorageService } from '../storage/storage.service';
import { IntegrationEvent } from '../auth/dtos/request/integration-event.dto';
import { UploadReaderDto } from './dtos/request/upload-reader.dto';
import { ResponseReaderDto } from './dtos/response/response-reader.dto';
import { UserQueueDto } from './dtos/request/user-queue.dto';

@Injectable()
export class ReaderService {
  constructor(
    @InjectRepository(ReaderEntity)
    private readonly readerRepository: Repository<ReaderEntity>,
    private readonly dataSource: DataSource,
    private readonly storageService: StorageService,
    private readonly mediaService: MediaService,
  ) {}

  async updateReader(updateReaderDto: { userId: string, uploadReaderDto: UploadReaderDto }): Promise<any> {
    await this.readerRepository.update(
      { userId: updateReaderDto.userId },
      { ...updateReaderDto.uploadReaderDto, updatedAt: new Date() },
    );

    const reader = await this.readerRepository.findOneByOrFail({
      userId: updateReaderDto.userId,
    });

    return {
      message: 'Leitor atualizado com sucesso',
      data: reader,
    };
  }

  async uploadImageReader(userId: string, file: Express.Multer.File): Promise<ResponseReaderDto> {
    const objectName = 'readers';
    const processedImage = await this.mediaService.processImage(file, ImageType.USER_AVATAR);
    const key = await this.storageService.uploadFile(processedImage, objectName);

    await this.readerRepository.update(
      { userId },
      { imageUrl: key, updatedAt: new Date() },
    );

    const reader = await this.readerRepository.findOneByOrFail({ userId });
    const publicImageUrl = this.storageService.getPublicUrl(reader.imageUrl as string);

    return {
      message: 'Imagem do leitor atualizada com sucesso',
      data: {
        ...reader,
        imageUrl: publicImageUrl,
      },
    };

  }

  async handleUserCreated(
    event: IntegrationEvent<UserQueueDto>,
  ): Promise<void> {
    await this.processOnce(event, 'reader-sync', async (manager) => {
      await manager.upsert(
        ReaderEntity,
        {
          userId: event.data.userId,
          email: event.data.email,
          username: event.data.username,
          name: event.data.username,
          updatedAt: new Date(),
        },
        ['userId'],
      );
    });
  }

  async handleUserUpdated(
    event: IntegrationEvent<UserQueueDto>,
  ): Promise<void> {
    await this.processOnce(event, 'reader-sync', async (manager) => {
      await manager.update(
        ReaderEntity,
        {
          userId: event.data.userId,
        },
        {
          email: event.data.email,
          username: event.data.username,
          updatedAt: new Date(),
        },
      );
    });
  }

  async handleUserDeleted(
    event: IntegrationEvent<UserQueueDto>,
  ): Promise<void> {
    await this.processOnce(event, 'reader-sync', async (manager) => {
      await manager.delete(ReaderEntity, {
        userId: event.data.userId,
      });
    });
  }

  private async processOnce<T>(
    eventId: IntegrationEvent<T>,
    consumer: string,
    handler: (manager: EntityManager) => Promise<void>,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const insertResult = await manager
        .createQueryBuilder()
        .insert()
        .into(ProcessedEventEntity)
        .values({
          eventId: eventId.eventId,
          consumer: consumer,
        })
        .orIgnore()
        .returning('id')
        .execute();

      if (insertResult.raw.length === 0) {
        return;
      }

      await handler(manager);
    });
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';

import { ImageType } from '../media/enums/image-type.enum';
import { ReaderEntity } from './entities/reader.entity';
import { ProcessedEventEntity } from './entities/processed-event.entity';
import { AgeVerificationEntity } from '../age-verification/entities/age-verification.entity';
import { SocialMediaLinkEntity } from '../social-media-link/entities/social-media-link.entity';

import { MediaService } from '../media/media.service';
import { StorageService } from '../storage/storage.service';
import { AgeVerificationService } from '../age-verification/age-verification.service';
import { IntegrationEvent } from '../auth/dtos/request/integration-event.dto';
import { SocialMediaLinkService } from '../social-media-link/social-media-link.service';

import { UploadReaderDto } from './dtos/request/upload-reader.dto';
import { ResponseReaderDto } from './dtos/response/response-reader.dto';
import { UserQueueDto } from './dtos/request/user-queue.dto';
import { CreateAgeVerificationDto } from '../age-verification/dtos/request/create-age-verification.dto';
import { CreateSocialMediaLinkDto } from '../social-media-link/dtos/request/create-social-media-link.dto';

import { AgeVerificationMapper } from '../age-verification/mappers/age-verification.mapper';
import { SocialMediaLinkMapper } from '../social-media-link/mappers/social-media-link.mapper';

@Injectable()
export class ReaderService {
  constructor(
    @InjectRepository(ReaderEntity)
    private readonly readerRepository: Repository<ReaderEntity>,
    private readonly dataSource: DataSource,
    private readonly storageService: StorageService,
    private readonly mediaService: MediaService,
    private readonly ageVerificationService: AgeVerificationService,
    private readonly ageVerificationMapper: AgeVerificationMapper,
    private readonly socialMediaLinkMapper: SocialMediaLinkMapper,
    private readonly socialMediaLinkService: SocialMediaLinkService,
  ) {}

  async getReader(userId: string): Promise<ResponseReaderDto> {
    const reader = await this.readerRepository.findOneByOrFail({ userId });
    const publicImageUrl = this.storageService.getPublicUrl(reader.imageUrl as string);

    const ageVerification = await this.ageVerificationService.getAgeVerificationByReaderId(reader);
    const socialMediaLinks = await this.socialMediaLinkService.getSocialMediaLinksByReaderId(reader);

    return {
      message: 'Leitor recuperado com sucesso',
      data: {
        id: reader.id,
        email: reader.email,
        username: reader.username,
        name: reader.name,
        imageUrl: publicImageUrl,
        description: reader.description,
        ageVerification: ageVerification ?? undefined,
        socialMediaLinks: socialMediaLinks ?? undefined,
      },      
    };
  }

  async updateReader(updateReaderDto: { userId: string, uploadReaderDto: UploadReaderDto }): Promise<any> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const { ageVerification, socialMediaLinks, ...readerData } = updateReaderDto.uploadReaderDto;
        let ageVerificationRecord;
        let socialMediaLinkRecords;

        await manager.update(
          ReaderEntity,
          { userId: updateReaderDto.userId },
          { ...readerData, updatedAt: new Date() },
        );

        const reader = await manager.findOneByOrFail(ReaderEntity, {
          userId: updateReaderDto.userId,
        });

        if (ageVerification) 
          ageVerificationRecord = await this.saveAgeVerificationInDatabase(manager, reader, ageVerification);

        if (socialMediaLinks?.length)
          socialMediaLinkRecords = await this.saveSocialMediaLinkInDatabase(manager, reader, socialMediaLinks);

        return {
          message: 'Leitor atualizado com sucesso',
          data: {
            ...reader,
            ageVerification: ageVerificationRecord
              ? this.ageVerificationMapper.toModelFromEntity(ageVerificationRecord, false)
              : null,
            socialMediaLink: socialMediaLinkRecords
              ? socialMediaLinkRecords.map((record) => this.socialMediaLinkMapper.toModelFromEntity(record, false))
              : null,
          },
        };
      });
    } catch (error: Error | unknown) {
      throw new Error(`Failed to update reader: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
        id: reader.id,
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

  private async saveAgeVerificationInDatabase(
    manager: EntityManager, 
    reader: ReaderEntity, 
    ageVerification: CreateAgeVerificationDto
  ): Promise<AgeVerificationEntity> {
    const result = await manager.createQueryBuilder()
      .insert()
      .into(AgeVerificationEntity)
      .values({
        reader: { id: reader.id },
        hasLegalAge: this.ageVerificationService.hasLegalAge(ageVerification.dateOfBirth),
        dateOfBirth: ageVerification.dateOfBirth,
      })
      .orIgnore()
      .returning('*')
      .execute();

    return manager.findOneOrFail(AgeVerificationEntity, {
      where: {
        reader: { id: reader.id },
      },
      relations: {
        reader: true,
      },
    });
  }

  private async saveSocialMediaLinkInDatabase(
    manager: EntityManager,
    reader: ReaderEntity,
    socialMediaLinks: CreateSocialMediaLinkDto[]
  ): Promise<SocialMediaLinkEntity[]> {
    const result = await manager.createQueryBuilder()
      .insert()
      .into(SocialMediaLinkEntity)
      .values(
        socialMediaLinks.map((link) => ({
          reader: { id: reader.id },
          name: link.name as string,
          url: link.url,
        })),
      )
      .orIgnore()
      .returning('*')
      .execute();

    return manager.find(SocialMediaLinkEntity, {
      where: {
        reader: { id: reader.id },
        name: In(socialMediaLinks.map((link) => link.name)),
      },
      relations: {
        reader: true,
      },
    });
  }

}

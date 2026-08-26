import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { ProcessedEventEntity } from './entities/processed-event.entity';
import { ReaderEntity } from './entities/reader.entity';
import { CreateReaderDto } from './dtos/request/create-reader.dto';
import { UserQueueDto } from './dtos/request/user-queue.dto';
import { IntegrationEvent } from './dtos/request/integration-event.dto';

@Injectable()
export class ReaderService {
  constructor(
    @InjectRepository(ReaderEntity)
    private readonly readerRepository: Repository<ReaderEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async createReader(createReaderDto: CreateReaderDto): Promise<any> {
    const existingReader = await this.readerRepository.findOne({
      where: { userId: createReaderDto.userId },
    });

    await this.readerRepository.upsert(
      { ...createReaderDto, updatedAt: new Date() },
      ['userId'],
    );

    const reader = await this.readerRepository.findOneByOrFail({
      userId: createReaderDto.userId,
    });

    return {
      message: existingReader
        ? 'Leitor atualizado com sucesso'
        : 'Leitor criado com sucesso',
      data: reader,
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

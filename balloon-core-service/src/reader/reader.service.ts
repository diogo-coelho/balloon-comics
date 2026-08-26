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
    try {
      const existingReader = await this.readerRepository.findOne({
        where: { userId: createReaderDto.userId },
      });

      if (existingReader) {
        const updatedReader = await this.readerRepository.update(
          existingReader.id as string,
          { ...createReaderDto, updatedAt: new Date() },
        );
        return {
          message: 'Leitor atualizado com sucesso',
          data: updatedReader.affected
            ? { ...existingReader, ...createReaderDto }
            : existingReader,
        };
      }

      const reader = this.readerRepository.create(createReaderDto);
      const insertedReader = await this.readerRepository.save(reader);
      return {
        message: 'Leitor criado com sucesso',
        data: insertedReader,
      };
    } catch (error: Error | any | undefined) {
      throw new InternalServerErrorException('Erro ao criar ou atualizar leitor');
    }
  }

  async handleUserCreated(
    event: IntegrationEvent<UserQueueDto>,
  ): Promise<void> {
    await this.processOnce(event, 'reader-sync', async (manager) => {
      const reader = manager.create(ReaderEntity, {
        userId: event.data.userId,
        email: event.data.email,
        username: event.data.username,

        name: event.data.username,
      });

      await manager.save(ReaderEntity, reader);
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

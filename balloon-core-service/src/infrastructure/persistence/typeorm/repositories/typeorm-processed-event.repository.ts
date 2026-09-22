import { Injectable } from '@nestjs/common';
import { ProcessedEventRepositoryPort } from '../../../../application/ports/processed-event.repository.port';
import { InjectRepository } from '@nestjs/typeorm';
import { ProcessedEventOrmEntity } from '../entities/processed-event.orm-entity';
import { Repository } from 'typeorm';

@Injectable()
export class TypeOrmProcessedEventRepository implements ProcessedEventRepositoryPort {
  constructor(
    @InjectRepository(ProcessedEventOrmEntity)
    private readonly processedEventRepository: Repository<ProcessedEventOrmEntity>,
  ) {}

  async tryMarkAsProcessed(
    eventId: string,
    consumer: string,
  ): Promise<boolean> {
    const result = await this.processedEventRepository
      .createQueryBuilder()
      .insert()
      .into(ProcessedEventOrmEntity)
      .values({
        eventId,
        consumer,
      })
      .orIgnore()
      .returning('id')
      .execute();

    return Array.isArray(result.raw) && result.raw.length > 0;
  }
}

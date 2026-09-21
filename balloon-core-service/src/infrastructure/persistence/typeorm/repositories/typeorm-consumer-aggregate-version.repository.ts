import { Repository } from 'typeorm';
import { ConsumerAggregateVersionRepositoryPort } from '../../../../application/ports/consumer-aggregate-version.repository.port';
import { ConsumerAggregateVersion } from '../../../../application/types/consumer-aggregate-version';
import { ConsumerAggregateVersionOrmEntity } from '../entities/consumer-aggregate-version.orm-entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TypeOrmConsumerAggregateVersionRepository implements ConsumerAggregateVersionRepositoryPort {
  constructor(
    @InjectRepository(ConsumerAggregateVersionOrmEntity)
    private readonly consumerAggregateVersionRepository: Repository<ConsumerAggregateVersionOrmEntity>,
  ) {}

  async getOrCreateForUpdate(
    aggregateId: string,
    consumer: string,
  ): Promise<ConsumerAggregateVersion> {
    await this.consumerAggregateVersionRepository
      .createQueryBuilder()
      .insert()
      .into(ConsumerAggregateVersionOrmEntity)
      .values({
        aggregateId,
        consumer,
        lastAppliedVersion: 0,
      })
      .orIgnore()
      .execute();

    const entity = await this.consumerAggregateVersionRepository.findOneOrFail({
      where: { aggregateId, consumer },
      lock: { mode: 'pessimistic_write' },
    });

    return {
      aggregateId: entity.aggregateId,
      consumer: entity.consumer,
      lastAppliedVersion: entity.lastAppliedVersion,
    };
  }

  async updateVersion(
    aggregateId: string,
    consumer: string,
    version: number,
  ): Promise<void> {
    await this.consumerAggregateVersionRepository.update(
      { aggregateId, consumer },
      { lastAppliedVersion: version, updatedAt: new Date() },
    );
  }
}

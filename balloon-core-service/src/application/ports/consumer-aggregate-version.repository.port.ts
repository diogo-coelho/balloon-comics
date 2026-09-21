import { ConsumerAggregateVersion } from '../types/consumer-aggregate-version';

export interface ConsumerAggregateVersionRepositoryPort {
  getOrCreateForUpdate(
    aggregateId: string,
    consumer: string,
  ): Promise<ConsumerAggregateVersion>;

  updateVersion(
    aggregateId: string,
    consumer: string,
    version: number,
  ): Promise<void>;
}

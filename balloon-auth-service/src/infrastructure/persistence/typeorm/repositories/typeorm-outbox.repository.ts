import { Repository } from 'typeorm';
import { OutboxRepositoryPort } from '../../../../application/ports/outbox.repository';
import { OutboxOrmEntity } from '../entities/outbox-event.orm-entity';
import { DomainEvent } from '../../../../domain/shared/events/domain-event';

export class TypeOrmOutboxRepository implements OutboxRepositoryPort {
  constructor(private readonly repository: Repository<OutboxOrmEntity>) {}

  async save(event: DomainEvent): Promise<void> {
    const entity = this.repository.create({
      id: event.eventId,
      eventType: event.eventType,
      userId: event.userId,
      aggregateVersion: event.aggregateVersion,
      payload: event.data as Record<string, unknown>,
      status: 'pending',
      attempts: 0,
    });

    await this.repository.save(entity);
  }
}

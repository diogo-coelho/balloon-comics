import { Repository } from "typeorm";
import { OutboxRepositoryPort } from "../../../../application/ports/outbox.repository";
import { UserCreatedEvent } from "../../../../domain/user/events/user-created.event";
import { OutboxOrmEntity } from "../entities/outbox-event.orm-entity";

export class TypeOrmOutboxRepository implements OutboxRepositoryPort {
  constructor(
    private readonly repository: Repository<OutboxOrmEntity>,
  ) {}
    
  async save(event: UserCreatedEvent): Promise<void> {
    const entity = this.repository.create({
      id: event.eventId,
      eventType: event.eventType,
      userId: event.aggregateId,
      aggregateVersion: event.aggregateVersion,
      payload: event.payload,
      status: 'pending',
      attempts: 0,
    });

    await this.repository.save(entity);  }

}
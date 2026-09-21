import { DomainEvent } from "../../domain/shared/events/domain-event";

export interface OutboxRepositoryPort {
  save(
    event: DomainEvent,
  ): Promise<void>;
}
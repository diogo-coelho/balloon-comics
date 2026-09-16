import { DomainEvent } from "../../infrastructure/contracts/integration-event.contract";

export interface OutboxRepositoryPort {
  save(
    event: DomainEvent,
  ): Promise<void>;
}
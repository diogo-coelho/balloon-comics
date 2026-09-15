import { UserCreatedEvent } from "../../domain/user/events/user-created.event";

export interface OutboxRepositoryPort {
  save(event: UserCreatedEvent): Promise<void>;
}
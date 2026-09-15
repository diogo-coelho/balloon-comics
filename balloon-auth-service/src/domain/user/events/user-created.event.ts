import { randomUUID } from "node:crypto";

export class UserCreatedEvent {

  readonly eventId: string;
  readonly eventType = 'user.created';
  readonly occurredAt: Date;

  constructor(
    readonly aggregateId: string,
    readonly aggregateVersion: number,
    readonly payload: {
      userId: string;
      username: string;
      email: string;
    }
  ) {
    this.eventId = randomUUID();
    this.occurredAt = new Date();
  }
}
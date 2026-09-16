import { randomUUID } from "node:crypto";

export class UserUpdatedEvent {
  readonly eventId: string;
  readonly eventType = 'user.updated';
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
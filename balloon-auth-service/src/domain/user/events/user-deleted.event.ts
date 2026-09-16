import { randomUUID } from "node:crypto";

export class UserDeletedEvent {
  readonly eventId: string;
  readonly eventType = 'user.deleted';
  readonly occurredAt: Date;
  
  constructor(
    readonly aggregateId: string,
    readonly aggregateVersion: number,
    readonly payload: {
      userId: string;
    }
  ) {
    this.eventId = randomUUID();
    this.occurredAt = new Date();
  }
}
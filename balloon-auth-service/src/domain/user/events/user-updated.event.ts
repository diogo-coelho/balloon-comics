import { randomUUID } from "node:crypto";
import { UserEventType } from "./user-event-type";

export class UserUpdatedEvent {
  readonly eventId: string;
  readonly eventType = UserEventType.UPDATED;
  readonly occurredAt: Date;

  constructor(
    readonly userId: string,
    readonly aggregateVersion: number,
    readonly data: {
      userId: string;
      username: string;
      email: string;
    }
  ) {
    this.eventId = randomUUID();
    this.occurredAt = new Date();
  }
}
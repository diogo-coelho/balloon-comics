import { randomUUID } from "node:crypto";
import { UserEventType } from "./user-event-type";

export class UserCreatedEvent {

  readonly eventId: string;
  readonly eventType = UserEventType.CREATED;
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
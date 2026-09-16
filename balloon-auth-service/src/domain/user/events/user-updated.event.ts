import { randomUUID } from "node:crypto";
import { AUTH_ROUTING_KEYS } from "../../../infrastructure/constants/routing-keys";

export class UserUpdatedEvent {
  readonly eventId: string;
  readonly eventType = AUTH_ROUTING_KEYS.USER_UPDATED;
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
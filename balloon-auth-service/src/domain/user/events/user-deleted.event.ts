import { randomUUID } from 'node:crypto';
import { UserEventType } from './user-event-type';

export class UserDeletedEvent {
  readonly eventId: string;
  readonly eventType = UserEventType.DELETED;
  readonly occurredAt: Date;

  constructor(
    readonly userId: string,
    readonly aggregateVersion: number,
    readonly data: {
      userId: string;
    },
  ) {
    this.eventId = randomUUID();
    this.occurredAt = new Date();
  }
}

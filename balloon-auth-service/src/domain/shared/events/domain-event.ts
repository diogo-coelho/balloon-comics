export interface DomainEvent<T = unknown> {
  eventId: string;
  eventType: string;
  userId: string;
  aggregateVersion: number;
  occurredAt: Date;
  data: T;
}
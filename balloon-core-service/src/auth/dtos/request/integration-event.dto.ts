export interface IntegrationEvent<T> {
  eventId: string;
  eventType: string;
  aggregateId: string;
  occurredAt: string;
  version: number;
  data: T;
}

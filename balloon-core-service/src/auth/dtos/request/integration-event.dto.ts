export interface IntegrationEvent<T> {
  eventId: string;
  eventType: string;
  aggregateId: string;
  occurredAt: string;
  version: number;
  aggregateVersion: number;
  data: T;
}

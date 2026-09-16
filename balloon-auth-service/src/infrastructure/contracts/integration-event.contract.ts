export interface IntegrationEventContract<T = Record<string, unknown>> {
  eventId: string;
  eventType: string;
  aggregateId: string;
  occurredAt: string;
  version: number;
  aggregateVersion: number;
  data: T;
}

export interface DomainEvent<T = unknown> {
  eventId: string;
  eventType: string;
  userId: string;
  aggregateVersion: number;
  occurredAt: Date;
  data: T;
}

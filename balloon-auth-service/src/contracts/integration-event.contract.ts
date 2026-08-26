export interface IntegrationEventContract<T = Record<string, unknown>> {
  eventId: string;
  eventType: string;
  aggregateId: string;
  occurredAt: string;
  version: number;
  data: T;
}
export type ConsumerAggregateVersion = {
  aggregateId: string;
  consumer: string;
  lastAppliedVersion: number;
};

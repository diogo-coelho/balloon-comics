import { ConsumerAggregateVersionRepositoryPort } from "./consumer-aggregate-version.repository.port";
import { ProcessedEventRepositoryPort } from "./processed-event.repository.port";
import { ReaderRepositoryPort } from "./reader.repository.port";

export interface CoreTransactionalPort {
  readers: ReaderRepositoryPort;
  processedEvents: ProcessedEventRepositoryPort;
  consumerAggregateVersion: ConsumerAggregateVersionRepositoryPort;
}
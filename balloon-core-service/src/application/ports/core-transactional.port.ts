import { AgeVerificationRepositoryPort } from './age-verification.repository.port';
import { ConsumerAggregateVersionRepositoryPort } from './consumer-aggregate-version.repository.port';
import { ProcessedEventRepositoryPort } from './processed-event.repository.port';
import { ReaderRepositoryPort } from './reader.repository.port';
import { SocialmediaLinkRepositoryPort } from './social-media-link.repository.port';

export interface CoreTransactionalPort {
  readers: ReaderRepositoryPort;
  processedEvents: ProcessedEventRepositoryPort;
  consumerAggregateVersion: ConsumerAggregateVersionRepositoryPort;
  ageVerifications: AgeVerificationRepositoryPort;
  socialMediaLinks: SocialmediaLinkRepositoryPort;
}

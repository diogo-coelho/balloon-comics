export interface ProcessedEventRepositoryPort {
  
  tryMarkAsProcessed(eventId: string, consumer: string): Promise<boolean>;

}
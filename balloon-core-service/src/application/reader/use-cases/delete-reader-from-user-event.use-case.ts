import { IntegrationEvent } from '../../messaging/contracts/integration-event.contract';
import { EventMessageOutOfOrder } from '../../messaging/errors/event-message-out-of-order.error';
import { CoreUnitOfWorkPort } from '../../ports/core-unit-of-work.port';
import { UserDeletedEventData } from '../../types/user-sync';

export class DeleteReaderFromUserEventUseCase {
  private static readonly CONSUMER = 'reader-sync';

  constructor(private readonly unitOfWork: CoreUnitOfWorkPort) {}

  async execute(event: IntegrationEvent<UserDeletedEventData>): Promise<void> {
    await this.unitOfWork.execute(async (transaction) => {
      const isNewEvent = await transaction.processedEvents.tryMarkAsProcessed(
        event.eventId,
        DeleteReaderFromUserEventUseCase.CONSUMER,
      );

      if (!isNewEvent) return;

      const aggregateState =
        await transaction.consumerAggregateVersion.getOrCreateForUpdate(
          event.aggregateId,
          DeleteReaderFromUserEventUseCase.CONSUMER,
        );

      if (event.aggregateVersion <= aggregateState.lastAppliedVersion) return;

      const expectedVersion = aggregateState.lastAppliedVersion + 1;

      if (event.aggregateVersion !== expectedVersion)
        throw new EventMessageOutOfOrder(
          event.aggregateId,
          expectedVersion,
          event.aggregateVersion,
        );

      await transaction.readers.deleteByUserId(event.data.userId);

      await transaction.consumerAggregateVersion.updateVersion(
        event.aggregateId,
        DeleteReaderFromUserEventUseCase.CONSUMER,
        event.aggregateVersion,
      );
    });
  }
}

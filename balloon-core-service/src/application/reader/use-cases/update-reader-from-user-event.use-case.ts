import { IntegrationEvent } from "../../../presentation/messaging/contracts/integration-event.contract";
import { EventMessageOutOfOrder } from "../../messaging/errors/event-message-out-of-order.error";
import { CoreUnitOfWorkPort } from "../../ports/core-unit-of-work.port";
import { UserUpdatedEventData } from "../../types/user-sync";

export class UpdateReaderFromUserEventUseCase {

  private static readonly CONSUMER = 'reader-sync';

  constructor(
    private readonly unitofWork: CoreUnitOfWorkPort
  ) {}

  async execute(event: IntegrationEvent<UserUpdatedEventData>): Promise<void> {
    await this.unitofWork.execute(async (transaction) => {
      const isNewEvent = await transaction.processedEvents.tryMarkAsProcessed(
        event.eventId,
        UpdateReaderFromUserEventUseCase.CONSUMER
      );

      if (!isNewEvent) return;

      const aggregateState = await transaction.consumerAggregateVersion.getOrCreateForUpdate(
        event.aggregateId,
        UpdateReaderFromUserEventUseCase.CONSUMER
      );

      if (event.aggregateVersion <= aggregateState.lastAppliedVersion) return;

      const expectedVersion = aggregateState.lastAppliedVersion + 1;

      if (event.aggregateVersion !== expectedVersion) 
        throw new EventMessageOutOfOrder(event.aggregateId, expectedVersion, event.aggregateVersion);

      await transaction.readers.synchronizeUserData({
        userId: event.data.userId,
        username: event.data.username,
        email: event.data.email,
      });

      await transaction.consumerAggregateVersion.updateVersion(
        event.aggregateId,
        UpdateReaderFromUserEventUseCase.CONSUMER,
        event.aggregateVersion
      );
    });
  }
}
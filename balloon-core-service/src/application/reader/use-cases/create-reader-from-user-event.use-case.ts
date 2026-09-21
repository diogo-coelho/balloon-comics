import { Reader } from "../../../domain/reader/entities/reader";
import { CoreUnitOfWorkPort } from "../../ports/core-unit-of-work.port";
import { UserCreatedEventData } from "../../types/user-sync";
import { IntegrationEvent } from "../../messaging/contracts/integration-event.contract";
import { EventMessageOutOfOrder } from "../../messaging/errors/event-message-out-of-order.error";

export class CreateReaderFromUserEventUseCase {

  private static readonly CONSUMER = 'reader-sync';

  constructor(
    private readonly unitOfWork: CoreUnitOfWorkPort,
  ) {}

  async execute(event: IntegrationEvent<UserCreatedEventData>): Promise<void> {
    await this.unitOfWork.execute(async (transaction) => {
      const isNewEvent = await transaction.processedEvents.tryMarkAsProcessed(
        event.eventId,
        CreateReaderFromUserEventUseCase.CONSUMER,
      );

      if (!isNewEvent) return;

      const aggregateState = await transaction.consumerAggregateVersion
        .getOrCreateForUpdate(
          event.aggregateId,
          CreateReaderFromUserEventUseCase.CONSUMER,
        );

      if (event.aggregateVersion <= aggregateState.lastAppliedVersion) return;
      const expectedVersion = aggregateState.lastAppliedVersion + 1;
      if (event.aggregateVersion !== expectedVersion) throw new EventMessageOutOfOrder(event.aggregateId, expectedVersion, event.aggregateVersion);

      const reader = Reader.create({
        userId: event.data.userId,
        username: event.data.username,
        email: event.data.email,
      });

      await transaction.readers.upsert(reader);

      await transaction.consumerAggregateVersion.updateVersion(
        event.aggregateId,
        CreateReaderFromUserEventUseCase.CONSUMER,
        event.aggregateVersion,
      );
    });
  }

}
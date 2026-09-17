import { CreateReaderFromUserEventUseCase } from "../reader/use-cases/create-reader-from-user-event.use-case";
import { EventMessageOutOfOrder } from "../messaging/errors/event-message-out-of-order.error";

describe("CreateReaderFromUserEventUseCase", () => {
  it("deve criar o leitor e registrar a versão do agregado quando o evento é novo e válido", async () => {
    const event = {
      eventId: "event-1",
      aggregateId: "user-1",
      aggregateVersion: 1,
      data: { userId: "user-1", username: "ana", email: "ana@example.com" },
    } as any;

    const transaction = {
      processedEvents: { tryMarkAsProcessed: jest.fn().mockResolvedValue(true) },
      consumerAggregateVersion: {
        getOrCreateForUpdate: jest.fn().mockResolvedValue({ lastAppliedVersion: 0 }),
        updateVersion: jest.fn().mockResolvedValue(undefined),
      },
      readers: { upsert: jest.fn().mockResolvedValue(undefined) },
    };

    const unitOfWork = { execute: jest.fn(async (operation) => operation(transaction)) };

    await new CreateReaderFromUserEventUseCase(unitOfWork as any).execute(event);

    expect(transaction.processedEvents.tryMarkAsProcessed).toHaveBeenCalledWith("event-1", "reader-sync");
    expect(transaction.readers.upsert).toHaveBeenCalledWith(expect.objectContaining({ userId: "user-1", email: "ana@example.com" }));
    expect(transaction.consumerAggregateVersion.updateVersion).toHaveBeenCalledWith("user-1", "reader-sync", 1);
  });

  it("deve ignorar eventos duplicados ou já processados", async () => {
    const event = {
      eventId: "event-duplicate",
      aggregateId: "user-2",
      aggregateVersion: 1,
      data: { userId: "user-2", username: "bia", email: "bia@example.com" },
    } as any;

    const transaction = {
      processedEvents: { tryMarkAsProcessed: jest.fn().mockResolvedValue(false) },
      consumerAggregateVersion: { getOrCreateForUpdate: jest.fn(), updateVersion: jest.fn() },
      readers: { upsert: jest.fn() },
    };

    await new CreateReaderFromUserEventUseCase({ execute: jest.fn(async (fn) => fn(transaction)) } as any).execute(event);

    expect(transaction.readers.upsert).not.toHaveBeenCalled();
    expect(transaction.consumerAggregateVersion.updateVersion).not.toHaveBeenCalled();
  });

  it("deve rejeitar eventos fora de ordem", async () => {
    const event = {
      eventId: "event-3",
      aggregateId: "user-3",
      aggregateVersion: 3,
      data: { userId: "user-3", username: "carlos", email: "carlos@example.com" },
    } as any;

    const transaction = {
      processedEvents: { tryMarkAsProcessed: jest.fn().mockResolvedValue(true) },
      consumerAggregateVersion: { getOrCreateForUpdate: jest.fn().mockResolvedValue({ lastAppliedVersion: 1 }), updateVersion: jest.fn() },
      readers: { upsert: jest.fn() },
    };

    await expect(
      new CreateReaderFromUserEventUseCase({ execute: jest.fn(async (fn) => fn(transaction)) } as any).execute(event),
    ).rejects.toBeInstanceOf(EventMessageOutOfOrder);
  });
});

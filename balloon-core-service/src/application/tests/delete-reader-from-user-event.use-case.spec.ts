import { DeleteReaderFromUserEventUseCase } from '../reader/use-cases/delete-reader-from-user-event.use-case';
import { EventMessageOutOfOrder } from '../messaging/errors/event-message-out-of-order.error';

describe('DeleteReaderFromUserEventUseCase', () => {
  it('deve excluir o leitor e registrar a última versão processada', async () => {
    const event = {
      eventId: 'event-delete-1',
      aggregateId: 'user-9',
      aggregateVersion: 3,
      data: { userId: 'user-9' },
    } as any;

    const transaction = {
      processedEvents: {
        tryMarkAsProcessed: jest.fn().mockResolvedValue(true),
      },
      consumerAggregateVersion: {
        getOrCreateForUpdate: jest
          .fn()
          .mockResolvedValue({ lastAppliedVersion: 2 }),
        updateVersion: jest.fn().mockResolvedValue(undefined),
      },
      readers: { deleteByUserId: jest.fn().mockResolvedValue(undefined) },
    };

    await new DeleteReaderFromUserEventUseCase({
      execute: jest.fn(async (operation) => operation(transaction)),
    }).execute(event);

    expect(transaction.readers.deleteByUserId).toHaveBeenCalledWith('user-9');
    expect(
      transaction.consumerAggregateVersion.updateVersion,
    ).toHaveBeenCalledWith('user-9', 'reader-sync', 3);
  });

  it('deve rejeitar evento fora de ordem durante exclusão', async () => {
    const event = {
      eventId: 'event-delete-2',
      aggregateId: 'user-9',
      aggregateVersion: 5,
      data: { userId: 'user-9' },
    } as any;

    const transaction = {
      processedEvents: {
        tryMarkAsProcessed: jest.fn().mockResolvedValue(true),
      },
      consumerAggregateVersion: {
        getOrCreateForUpdate: jest
          .fn()
          .mockResolvedValue({ lastAppliedVersion: 1 }),
        updateVersion: jest.fn(),
      },
      readers: { deleteByUserId: jest.fn() },
    };

    await expect(
      new DeleteReaderFromUserEventUseCase({
        execute: jest.fn(async (operation) => operation(transaction)),
      } as any).execute(event),
    ).rejects.toBeInstanceOf(EventMessageOutOfOrder);
  });
});

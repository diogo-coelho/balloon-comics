import { UpdateReaderFromUserEventUseCase } from '../reader/use-cases/update-reader-from-user-event.use-case';
import { EventMessageOutOfOrder } from '../messaging/errors/event-message-out-of-order.error';

describe('UpdateReaderFromUserEventUseCase', () => {
  it('deve sincronizar dados do leitor e atualizar a versão do agregado', async () => {
    const event = {
      eventId: 'event-update-1',
      aggregateId: 'user-1',
      aggregateVersion: 2,
      data: {
        userId: 'user-1',
        username: 'ana.souza',
        email: 'ana.nova@example.com',
      },
    } as any;

    const transaction = {
      processedEvents: {
        tryMarkAsProcessed: jest.fn().mockResolvedValue(true),
      },
      consumerAggregateVersion: {
        getOrCreateForUpdate: jest
          .fn()
          .mockResolvedValue({ lastAppliedVersion: 1 }),
        updateVersion: jest.fn().mockResolvedValue(undefined),
      },
      readers: { synchronizeUserData: jest.fn().mockResolvedValue(undefined) },
    };

    await new UpdateReaderFromUserEventUseCase({
      execute: jest.fn(async (operation) => operation(transaction)),
    }).execute(event);

    expect(transaction.readers.synchronizeUserData).toHaveBeenCalledWith({
      userId: 'user-1',
      username: 'ana.souza',
      email: 'ana.nova@example.com',
    });
    expect(
      transaction.consumerAggregateVersion.updateVersion,
    ).toHaveBeenCalledWith('user-1', 'reader-sync', 2);
  });

  it('deve ignorar evento antigo ou repetido', async () => {
    const event = {
      eventId: 'event-update-duplicate',
      aggregateId: 'user-1',
      aggregateVersion: 1,
      data: { userId: 'user-1', username: 'ana', email: 'ana@example.com' },
    } as any;

    const transaction = {
      processedEvents: {
        tryMarkAsProcessed: jest.fn().mockResolvedValue(false),
      },
      consumerAggregateVersion: {
        getOrCreateForUpdate: jest.fn(),
        updateVersion: jest.fn(),
      },
      readers: { synchronizeUserData: jest.fn() },
    };

    await new UpdateReaderFromUserEventUseCase({
      execute: jest.fn(async (operation) => operation(transaction)),
    }).execute(event);

    expect(transaction.readers.synchronizeUserData).not.toHaveBeenCalled();
  });

  it('deve rejeitar evento fora de ordem quando há lacuna na sequência', async () => {
    const event = {
      eventId: 'event-update-3',
      aggregateId: 'user-2',
      aggregateVersion: 4,
      data: { userId: 'user-2', username: 'bia', email: 'bia@example.com' },
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
      readers: { synchronizeUserData: jest.fn() },
    };

    await expect(
      new UpdateReaderFromUserEventUseCase({
        execute: jest.fn(async (operation) => operation(transaction)),
      } as any).execute(event),
    ).rejects.toBeInstanceOf(EventMessageOutOfOrder);
  });
});

import { DataSource } from 'typeorm';

import { OutboxEventsPublisher } from '../outbox-event.publish';
import { OutboxEventEntity } from '../../user/entities/outbox-event.entity';
import { RabbitMQProvider } from '../rabbit-mq.provider';
import { AUTH_EXCHANGE, AUTH_ROUTING_KEYS } from '../../constants/routing-keys';

describe('OutboxEventsPublisher', () => {
  let publisher: OutboxEventsPublisher;
  let outboxRepository: { update: jest.Mock };
  let dataSource: jest.Mocked<DataSource>;
  let rabbitMqProvider: jest.Mocked<RabbitMQProvider>;
  let repository: {
    createQueryBuilder: jest.Mock;
    save: jest.Mock;
  };
  let queryBuilder: {
    setLock: jest.Mock;
    setOnLocked: jest.Mock;
    where: jest.Mock;
    orderBy: jest.Mock;
    take: jest.Mock;
    getMany: jest.Mock;
  };

  const buildEvent = (
    overrides: Partial<OutboxEventEntity> = {},
  ): OutboxEventEntity =>
    ({
      id: 'event-id',
      userId: 'user-id',
      eventType: AUTH_ROUTING_KEYS.USER_CREATED,
      payload: { userId: 'user-id' },
      status: 'pending',
      attempts: 0,
      createdAt: new Date(),
      ...overrides,
    }) as OutboxEventEntity;

  beforeEach(() => {
    outboxRepository = { update: jest.fn() };

    queryBuilder = {
      setLock: jest.fn().mockReturnThis(),
      setOnLocked: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };

    repository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      save: jest.fn().mockImplementation(async (events) => events),
    };

    dataSource = {
      transaction: jest.fn((callback: any) =>
        callback({ getRepository: () => repository }),
      ),
    } as unknown as jest.Mocked<DataSource>;

    rabbitMqProvider = {
      publish: jest.fn(),
    } as unknown as jest.Mocked<RabbitMQProvider>;

    publisher = new OutboxEventsPublisher(
      outboxRepository as any,
      dataSource,
      rabbitMqProvider,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('não deve fazer nada quando não houver eventos pendentes', async () => {
    queryBuilder.getMany.mockResolvedValue([]);

    await publisher.publishPendingEvents();

    expect(rabbitMqProvider.publish).not.toHaveBeenCalled();
    expect(outboxRepository.update).not.toHaveBeenCalled();
  });

  it('deve publicar os eventos reivindicados e marcá-los como published', async () => {
    const event = buildEvent();
    queryBuilder.getMany.mockResolvedValue([event]);
    rabbitMqProvider.publish.mockResolvedValue(undefined);

    await publisher.publishPendingEvents();

    expect(rabbitMqProvider.publish).toHaveBeenCalledWith(
      AUTH_EXCHANGE,
      event.eventType,
      expect.objectContaining({
        eventId: event.id,
        eventType: event.eventType,
        aggregateId: event.userId,
      }),
    );
    expect(outboxRepository.update).toHaveBeenCalledWith(
      { id: expect.anything() },
      expect.objectContaining({ status: 'published' }),
    );
  });

  it('deve marcar o evento como pending quando a publicação falhar e o número de tentativas for baixo', async () => {
    const event = buildEvent({ attempts: 1 });
    queryBuilder.getMany.mockResolvedValue([event]);
    rabbitMqProvider.publish.mockRejectedValue(new Error('falha ao publicar'));

    await publisher.publishPendingEvents();

    expect(outboxRepository.update).toHaveBeenCalledWith(
      { id: expect.anything() },
      expect.objectContaining({
        status: 'pending',
        lastError: 'falha ao publicar',
      }),
    );
  });

  it('deve marcar o evento como failed quando o número de tentativas atingir o limite', async () => {
    const event = buildEvent({ attempts: 10 });
    queryBuilder.getMany.mockResolvedValue([event]);
    rabbitMqProvider.publish.mockRejectedValue(new Error('falha ao publicar'));

    await publisher.publishPendingEvents();

    expect(outboxRepository.update).toHaveBeenCalledWith(
      { id: expect.anything() },
      expect.objectContaining({ status: 'failed' }),
    );
  });

  it('não deve iniciar uma nova publicação enquanto outra estiver em andamento', async () => {
    let resolveGetMany: (value: OutboxEventEntity[]) => void = () => {};
    queryBuilder.getMany.mockReturnValue(
      new Promise((resolve) => {
        resolveGetMany = resolve;
      }),
    );

    const firstCall = publisher.publishPendingEvents();
    await publisher.publishPendingEvents();

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);

    resolveGetMany([]);
    await firstCall;
  });

  it('deve processar múltiplos eventos com sucessos e falhas e atualizar status adequadamente', async () => {
    const eventSuccess = buildEvent({ id: 'event-1', attempts: 0 });
    const eventFail = buildEvent({ id: 'event-2', attempts: 2 });
    queryBuilder.getMany.mockResolvedValue([eventSuccess, eventFail]);

    rabbitMqProvider.publish.mockImplementation(async (_ex, _rk, msg) => {
      if (msg.eventId === 'event-2') {
        throw 'falha de conexão string';
      }
    });

    await publisher.publishPendingEvents();

    expect(outboxRepository.update).toHaveBeenCalledWith(
      { id: expect.anything() },
      expect.objectContaining({ status: 'published' }),
    );
    expect(outboxRepository.update).toHaveBeenCalledWith(
      { id: expect.anything() },
      expect.objectContaining({
        status: 'pending',
        lastError: 'falha de conexão string',
      }),
    );
  });

  it('deve executar a cláusula Brackets do queryBuilder ao reivindicar eventos', async () => {
    let bracketsCallback: any;
    queryBuilder.where.mockImplementation((bracketsInstance: any) => {
      if (bracketsInstance?.whereFactory) {
        bracketsCallback = bracketsInstance.whereFactory;
      }
      return queryBuilder;
    });

    const mockSubQuery = {
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
    };

    queryBuilder.getMany.mockImplementation(async () => {
      if (bracketsCallback) {
        bracketsCallback(mockSubQuery);
      }
      return [];
    });

    await publisher.publishPendingEvents();

    expect(mockSubQuery.where).toHaveBeenCalledWith(
      'event.status = :pending',
      expect.objectContaining({ pending: 'pending' }),
    );
    expect(mockSubQuery.orWhere).toHaveBeenCalled();
  });
});

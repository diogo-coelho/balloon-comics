import { ConfigService } from '@nestjs/config';
import * as amqpConnectionManager from 'amqp-connection-manager';

import { RabbitMQProvider } from './rabbit-mq.provider';
import { AUTH_EXCHANGE } from '../constants/routing-keys';

jest.mock('amqp-connection-manager', () => ({
  connect: jest.fn(),
}));

describe('RabbitMQProvider', () => {
  let provider: RabbitMQProvider;
  let configService: jest.Mocked<ConfigService>;
  let mockChannel: {
    publish: jest.Mock;
    close: jest.Mock;
    on: jest.Mock;
    assertExchange: jest.Mock;
  };
  let mockConnection: {
    on: jest.Mock;
    createChannel: jest.Mock;
    close: jest.Mock;
  };
  let capturedSetup: (channel: any) => Promise<void>;

  beforeEach(() => {
    mockChannel = {
      publish: jest.fn().mockResolvedValue(undefined),
      close: jest.fn(),
      on: jest.fn(),
      assertExchange: jest.fn().mockResolvedValue(undefined),
    };

    mockConnection = {
      on: jest.fn(),
      createChannel: jest.fn().mockImplementation(async ({ setup }) => {
        capturedSetup = setup;
        await setup(mockChannel);
        return mockChannel;
      }),
      close: jest.fn(),
    };

    (amqpConnectionManager.connect as jest.Mock).mockResolvedValue(
      mockConnection,
    );

    configService = {
      getOrThrow: jest.fn().mockReturnValue('amqp://localhost'),
    } as unknown as jest.Mocked<ConfigService>;

    provider = new RabbitMQProvider(configService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('deve conectar ao RabbitMQ, declarar o exchange e registrar os listeners de conexão', async () => {
      await provider.onModuleInit();

      expect(amqpConnectionManager.connect).toHaveBeenCalledWith(
        'amqp://localhost',
        expect.objectContaining({ heartbeatIntervalInSeconds: 30 }),
      );
      expect(mockConnection.on).toHaveBeenCalledWith(
        'connect',
        expect.any(Function),
      );
      expect(mockConnection.on).toHaveBeenCalledWith(
        'disconnect',
        expect.any(Function),
      );
      expect(mockConnection.on).toHaveBeenCalledWith(
        'error',
        expect.any(Function),
      );
      expect(mockChannel.assertExchange).toHaveBeenCalledWith(
        AUTH_EXCHANGE,
        'topic',
        { durable: true },
      );
      expect(mockChannel.on).toHaveBeenCalledWith(
        'return',
        expect.any(Function),
      );
    });

    it('deve registrar uma mensagem retornada pelo broker através do listener "return"', async () => {
      await provider.onModuleInit();

      const returnHandler = mockChannel.on.mock.calls.find(
        ([event]) => event === 'return',
      )?.[1];

      returnHandler({ properties: { messageId: 'evento-sem-rota' } });

      await expect(
        provider.publish(AUTH_EXCHANGE, 'user.created', {
          eventId: 'evento-sem-rota',
          eventType: 'user.created',
          aggregateId: 'user-id',
          occurredAt: new Date().toISOString(),
          version: 1,
          data: {},
        }),
      ).rejects.toThrow('não possui rota RabbitMQ válida');
    });

    it('deve logar e relançar o erro quando a conexão falhar', async () => {
      const connectionError = new Error('falha na conexão');
      (amqpConnectionManager.connect as jest.Mock).mockRejectedValue(
        connectionError,
      );

      await expect(provider.onModuleInit()).rejects.toThrow(connectionError);
    });
  });

  describe('publish', () => {
    it('deve publicar a mensagem no canal com as opções corretas', async () => {
      await provider.onModuleInit();

      const event = {
        eventId: 'event-id',
        eventType: 'user.created',
        aggregateId: 'user-id',
        occurredAt: new Date().toISOString(),
        version: 1,
        data: { userId: 'user-id' },
      };

      await provider.publish(AUTH_EXCHANGE, 'user.created', event);

      expect(mockChannel.publish).toHaveBeenCalledWith(
        AUTH_EXCHANGE,
        'user.created',
        expect.any(Buffer),
        expect.objectContaining({
          persistent: true,
          mandatory: true,
          messageId: event.eventId,
        }),
      );
    });
  });

  describe('onModuleDestroy', () => {
    it('deve fechar o canal e a conexão', async () => {
      await provider.onModuleInit();

      await provider.onModuleDestroy();

      expect(mockChannel.close).toHaveBeenCalled();
      expect(mockConnection.close).toHaveBeenCalled();
    });
  });
});

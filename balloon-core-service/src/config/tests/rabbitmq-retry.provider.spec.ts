import * as amqpConnectionManager from 'amqp-connection-manager';
import type { Message } from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { RabbitMqRetryProvider } from '../rabbitmq-retry.provider';

jest.mock('amqp-connection-manager');

describe('RabbitMqRetryProvider', () => {
  let provider: RabbitMqRetryProvider;
  let configService: jest.Mocked<ConfigService>;
  let mockConnection: {
    createChannel: jest.Mock;
    close: jest.Mock;
  };
  let mockChannelWrapper: {
    publish: jest.Mock;
    close: jest.Mock;
  };

  beforeEach(() => {
    configService = {
      getOrThrow: jest.fn().mockImplementation((key: string) => {
        if (key === 'RABBITMQ_URL') return 'amqp://localhost:5672';
        if (key === 'RABBITMQ_RETRY_EXCHANGE') return 'balloon.retry.exchange';
        return '';
      }),
    } as unknown as jest.Mocked<ConfigService>;

    mockChannelWrapper = {
      publish: jest.fn().mockResolvedValue(true),
      close: jest.fn().mockResolvedValue(undefined),
    };

    mockConnection = {
      createChannel: jest.fn().mockReturnValue(mockChannelWrapper),
      close: jest.fn().mockResolvedValue(undefined),
    };

    (amqpConnectionManager.connect as jest.Mock).mockReturnValue(mockConnection);

    provider = new RabbitMqRetryProvider(configService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('deve inicializar conexão e canal com a topologia de retry', async () => {
      await provider.onModuleInit();

      expect(configService.getOrThrow).toHaveBeenCalledWith('RABBITMQ_URL');
      expect(configService.getOrThrow).toHaveBeenCalledWith('RABBITMQ_RETRY_EXCHANGE');
      expect(amqpConnectionManager.connect).toHaveBeenCalledWith(
        ['amqp://localhost:5672'],
        { heartbeatIntervalInSeconds: 30, reconnectTimeInSeconds: 5 },
      );
      expect(mockConnection.createChannel).toHaveBeenCalledWith(
        expect.objectContaining({
          confirm: true,
          publishTimeout: 10_000,
        }),
      );
    });

    it('deve configurar assertExchange e listener de retorno no canal', async () => {
      await provider.onModuleInit();

      const channelOptions = mockConnection.createChannel.mock.calls[0][0];
      const mockChannel = {
        assertExchange: jest.fn().mockResolvedValue({}),
        on: jest.fn(),
      };

      await channelOptions.setup(mockChannel);

      expect(mockChannel.assertExchange).toHaveBeenCalledWith(
        'balloon.retry.exchange',
        'topic',
        { durable: true },
      );
      expect(mockChannel.on).toHaveBeenCalledWith('return', expect.any(Function));

      // Test return listener with correlationId
      const returnHandler = mockChannel.on.mock.calls[0][1];
      const returnMsg = {
        fields: { routingKey: 'auth.user.created.v1' },
        properties: { correlationId: 'test-corr-id', messageId: 'msg-1' },
      };
      expect(() => returnHandler(returnMsg)).not.toThrow();

      // Test return listener without correlationId
      const returnMsgWithoutCorr = {
        fields: { routingKey: 'auth.user.created.v1' },
        properties: {},
      };
      expect(() => returnHandler(returnMsgWithoutCorr)).not.toThrow();
    });
  });

  describe('publishRetry', () => {
    const message: Message = {
      content: Buffer.from('event-payload'),
      fields: {
        deliveryTag: 1,
        redelivered: false,
        exchange: 'balloon.exchange',
        routingKey: 'auth.user.created.v1',
      },
      properties: {
        headers: { 'x-other-header': 'value' },
        messageId: 'msg-1',
        type: 'user.created',
        contentType: 'application/json',
      },
    } as unknown as Message;

    beforeEach(async () => {
      await provider.onModuleInit();
    });

    it('deve publicar a mensagem na retry exchange com os cabeçalhos de retry incrementados', async () => {
      await provider.publishRetry(message, 1);

      expect(configService.getOrThrow).toHaveBeenCalledWith('RABBITMQ_RETRY_EXCHANGE');
      expect(mockChannelWrapper.publish).toHaveBeenCalledWith(
        'balloon.retry.exchange',
        'auth.user.created.v1',
        message.content,
        expect.objectContaining({
          persistent: true,
          mandatory: true,
          messageId: 'msg-1',
          type: 'user.created',
          contentType: 'application/json',
          headers: {
            'x-other-header': 'value',
            'x-retry-count': 1,
          },
        }),
      );
    });

    it('deve lançar erro caso a mensagem de retry não encontre rota na exchange', async () => {
      const channelOptions = mockConnection.createChannel.mock.calls[0][0];
      let returnListener: (msg: any) => void = () => {};
      const mockChannel = {
        assertExchange: jest.fn().mockResolvedValue({}),
        on: jest.fn((event: string, cb: any) => {
          if (event === 'return') returnListener = cb;
        }),
      };
      await channelOptions.setup(mockChannel);

      mockChannelWrapper.publish.mockImplementation(
        async (_exchange: string, _routingKey: string, _content: any, options: any) => {
          returnListener({
            fields: { routingKey: 'auth.user.created.v1' },
            properties: { correlationId: options.correlationId, messageId: 'msg-1' },
          });
        },
      );

      await expect(provider.publishRetry(message, 1)).rejects.toThrow(
        /Mensagem de retry sem rota válida na exchange/,
      );
    });
  });

  describe('onModuleDestroy', () => {
    it('deve fechar canal e conexão ao destruir o módulo', async () => {
      await provider.onModuleInit();
      await provider.onModuleDestroy();

      expect(mockChannelWrapper.close).toHaveBeenCalled();
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('não deve lançar erro se canal e conexão forem indefinidos', async () => {
      const uninitializedProvider = new RabbitMqRetryProvider(configService);
      await expect(uninitializedProvider.onModuleDestroy()).resolves.toBeUndefined();
    });
  });
});
import * as amqp from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { setupRabbitMQ } from '../rabbitmq-topology.config';

jest.mock('amqplib');

describe('setupRabbitMQ', () => {
  let configService: jest.Mocked<ConfigService>;
  let mockChannel: {
    assertExchange: jest.Mock;
    assertQueue: jest.Mock;
    bindQueue: jest.Mock;
    close: jest.Mock;
  };
  let mockConnection: {
    createChannel: jest.Mock;
    close: jest.Mock;
  };

  const configMap: Record<string, any> = {
    RABBITMQ_URL: 'amqp://localhost:5672',
    RABBITMQ_QUEUE_KEY: 'auth.*',
    RABBITMQ_EXCHANGE: 'balloon.exchange',
    RABBITMQ_QUEUE: 'balloon.core.queue',
    RABBITMQ_DEAD_LETTER_EXCHANGE: 'balloon.dlx',
    RABBITMQ_DEAD_LETTER_ROUTING_KEY: 'balloon.dlq.key',
    RABBITMQ_RETRY_EXCHANGE: 'balloon.retry.exchange',
    RABBITMQ_RETRY_QUEUE: 'balloon.core.retry.queue',
    RABBITMQ_RETRY_DELAY_MS: 5000,
  };

  beforeEach(() => {
    configService = {
      getOrThrow: jest.fn().mockImplementation((key: string) => configMap[key]),
    } as unknown as jest.Mocked<ConfigService>;

    mockChannel = {
      assertExchange: jest.fn().mockResolvedValue({}),
      assertQueue: jest.fn().mockResolvedValue({}),
      bindQueue: jest.fn().mockResolvedValue({}),
      close: jest.fn().mockResolvedValue(undefined),
    };

    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
      close: jest.fn().mockResolvedValue(undefined),
    };

    (amqp.connect as jest.Mock).mockResolvedValue(mockConnection);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve configurar as exchanges, filas e bindings da topologia RabbitMQ e retornar MicroserviceOptions', async () => {
    const options = await setupRabbitMQ(configService);

    expect(amqp.connect).toHaveBeenCalledWith('amqp://localhost:5672');
    expect(mockConnection.createChannel).toHaveBeenCalled();

    // Exchanges
    expect(mockChannel.assertExchange).toHaveBeenCalledWith(
      'balloon.exchange',
      'topic',
      { durable: true },
    );
    expect(mockChannel.assertExchange).toHaveBeenCalledWith(
      'balloon.dlx',
      'direct',
      { durable: true },
    );
    expect(mockChannel.assertExchange).toHaveBeenCalledWith(
      'balloon.retry.exchange',
      'topic',
      { durable: true },
    );

    // DLQ Queue & Binding
    expect(mockChannel.assertQueue).toHaveBeenCalledWith(
      'balloon.core.queue.dlq',
      { durable: true },
    );
    expect(mockChannel.bindQueue).toHaveBeenCalledWith(
      'balloon.core.queue.dlq',
      'balloon.dlx',
      'balloon.dlq.key',
    );

    // Retry Queue & Binding
    expect(mockChannel.assertQueue).toHaveBeenCalledWith(
      'balloon.core.retry.queue',
      {
        durable: true,
        messageTtl: 5000,
        deadLetterExchange: 'balloon.exchange',
      },
    );
    expect(mockChannel.bindQueue).toHaveBeenCalledWith(
      'balloon.core.retry.queue',
      'balloon.retry.exchange',
      '#',
    );

    // Main Queue & Binding
    expect(mockChannel.assertQueue).toHaveBeenCalledWith(
      'balloon.core.queue',
      {
        durable: true,
        deadLetterExchange: 'balloon.dlx',
        deadLetterRoutingKey: 'balloon.dlq.key',
      },
    );
    expect(mockChannel.bindQueue).toHaveBeenCalledWith(
      'balloon.core.queue',
      'balloon.exchange',
      'auth.*',
    );

    // Cleanup
    expect(mockChannel.close).toHaveBeenCalled();
    expect(mockConnection.close).toHaveBeenCalled();

    // Return value
    expect(options).toEqual({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        exchange: 'balloon.exchange',
        exchangeType: 'topic',
        routingKey: 'auth.*',
        queue: 'balloon.core.queue',
        noAck: false,
        queueOptions: {
          durable: true,
          deadLetterExchange: 'balloon.dlx',
          deadLetterRoutingKey: 'balloon.dlq.key',
        },
      },
    });
  });

  it('deve lançar erro se alguma variável de configuração obrigatória estiver ausente', async () => {
    configService.getOrThrow.mockImplementation((key: string) => {
      if (key === 'RABBITMQ_URL') throw new Error('Missing RABBITMQ_URL');
      return configMap[key];
    });

    await expect(setupRabbitMQ(configService)).rejects.toThrow('Missing RABBITMQ_URL');
  });
});
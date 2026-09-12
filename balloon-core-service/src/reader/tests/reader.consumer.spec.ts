import { ConfigService } from '@nestjs/config';
import { RmqContext } from '@nestjs/microservices';
import type { Message } from 'amqplib';

import { ReaderConsumer } from '../reader.consumer';
import { ReaderService } from '../reader.service';
import { RabbitMqRetryProvider } from '../../config/rabbitmq-retry.provider';
import { IntegrationEvent } from '../../auth/dtos/request/integration-event.dto';
import { UserQueueDto } from '../dtos/request/user-queue.dto';

describe('ReaderConsumer', () => {
  let readerConsumer: ReaderConsumer;
  let readerService: jest.Mocked<ReaderService>;
  let retryProvider: jest.Mocked<RabbitMqRetryProvider>;
  let configService: jest.Mocked<ConfigService>;
  let channel: { ack: jest.Mock; nack: jest.Mock };
  let message: Message;
  let context: RmqContext;

  const event: IntegrationEvent<UserQueueDto> = {
    eventId: 'event-id',
    eventType: 'auth.user.created.v1',
    aggregateId: 'user-id',
    occurredAt: new Date().toISOString(),
    version: 1,
    aggregateVersion: 1,
    data: {
      userId: 'user-id',
      username: 'usuario',
      email: 'usuario@teste.com',
    },
  };

  beforeEach(() => {
    readerService = {
      handleUserCreated: jest.fn(),
      handleUserUpdated: jest.fn(),
      handleUserDeleted: jest.fn(),
    } as unknown as jest.Mocked<ReaderService>;

    retryProvider = {
      publishRetry: jest.fn(),
    } as unknown as jest.Mocked<RabbitMqRetryProvider>;

    configService = {
      getOrThrow: jest.fn().mockImplementation((key: string) => {
        if (key === 'RABBITMQ_MAX_RETRIES') {
          return 3;
        }
        return undefined;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    channel = { ack: jest.fn(), nack: jest.fn() };
    message = {
      content: Buffer.from('test-content'),
      fields: {
        deliveryTag: 1,
        redelivered: false,
        exchange: 'auth.events',
        routingKey: 'auth.user.created.v1',
      },
      properties: {
        headers: {},
        messageId: 'msg-123',
      },
    } as unknown as Message;

    context = {
      getChannelRef: () => channel,
      getMessage: () => message,
    } as unknown as RmqContext;

    readerConsumer = new ReaderConsumer(
      readerService,
      retryProvider,
      configService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('userCreated', () => {
    it('deve confirmar a mensagem (ack) quando o processamento for bem-sucedido', async () => {
      readerService.handleUserCreated.mockResolvedValue(undefined);

      await readerConsumer.userCreated(event, context);

      expect(readerService.handleUserCreated).toHaveBeenCalledWith(event);
      expect(channel.ack).toHaveBeenCalledWith(message);
      expect(channel.nack).not.toHaveBeenCalled();
    });

    it('deve publicar na retry queue e dar ack quando falhar e estiver abaixo do limite de retentativas', async () => {
      readerService.handleUserCreated.mockRejectedValue(new Error('falhou'));
      retryProvider.publishRetry.mockResolvedValue(undefined);

      await readerConsumer.userCreated(event, context);

      expect(configService.getOrThrow).toHaveBeenCalledWith(
        'RABBITMQ_MAX_RETRIES',
      );
      expect(retryProvider.publishRetry).toHaveBeenCalledWith(message, 1);
      expect(channel.ack).toHaveBeenCalledWith(message);
      expect(channel.nack).not.toHaveBeenCalled();
    });

    it('deve incrementar a contagem de retry baseada no header existente', async () => {
      message.properties.headers = { 'x-retry-count': 1 };
      readerService.handleUserCreated.mockRejectedValue(new Error('falhou'));
      retryProvider.publishRetry.mockResolvedValue(undefined);

      await readerConsumer.userCreated(event, context);

      expect(retryProvider.publishRetry).toHaveBeenCalledWith(message, 2);
      expect(channel.ack).toHaveBeenCalledWith(message);
    });

    it('deve dar nack com requeue=true quando a publicação no retry provider falhar', async () => {
      readerService.handleUserCreated.mockRejectedValue(new Error('falhou'));
      retryProvider.publishRetry.mockRejectedValue(
        new Error('retry publish failed'),
      );

      await readerConsumer.userCreated(event, context);

      expect(channel.nack).toHaveBeenCalledWith(message, false, true);
      expect(channel.ack).not.toHaveBeenCalled();
    });

    it('deve dar nack sem reenfileirar (dead letter) quando o limite máximo de retentativas for atingido', async () => {
      message.properties.headers = { 'x-retry-count': 3 };
      readerService.handleUserCreated.mockRejectedValue(new Error('falhou'));

      await readerConsumer.userCreated(event, context);

      expect(retryProvider.publishRetry).not.toHaveBeenCalled();
      expect(channel.nack).toHaveBeenCalledWith(message, false, false);
      expect(channel.ack).not.toHaveBeenCalled();
    });
  });

  describe('userUpdated', () => {
    it('deve confirmar a mensagem (ack) quando o processamento for bem-sucedido', async () => {
      readerService.handleUserUpdated.mockResolvedValue(undefined);

      await readerConsumer.userUpdated(event, context);

      expect(readerService.handleUserUpdated).toHaveBeenCalledWith(event);
      expect(channel.ack).toHaveBeenCalledWith(message);
    });

    it('deve acionar retry quando falhar', async () => {
      readerService.handleUserUpdated.mockRejectedValue(new Error('falhou'));
      retryProvider.publishRetry.mockResolvedValue(undefined);

      await readerConsumer.userUpdated(event, context);

      expect(retryProvider.publishRetry).toHaveBeenCalledWith(message, 1);
      expect(channel.ack).toHaveBeenCalledWith(message);
    });

    it('deve rejeitar a mensagem (nack) sem reenfileirar quando atingir o limite de retentativas', async () => {
      message.properties.headers = { 'x-retry-count': 3 };
      readerService.handleUserUpdated.mockRejectedValue(new Error('falhou'));

      await readerConsumer.userUpdated(event, context);

      expect(channel.nack).toHaveBeenCalledWith(message, false, false);
    });
  });

  describe('userDeleted', () => {
    it('deve confirmar a mensagem (ack) quando o processamento for bem-sucedido', async () => {
      readerService.handleUserDeleted.mockResolvedValue(undefined);

      await readerConsumer.userDeleted(event, context);

      expect(readerService.handleUserDeleted).toHaveBeenCalledWith(event);
      expect(channel.ack).toHaveBeenCalledWith(message);
    });

    it('deve acionar retry quando falhar', async () => {
      readerService.handleUserDeleted.mockRejectedValue(new Error('falhou'));
      retryProvider.publishRetry.mockResolvedValue(undefined);

      await readerConsumer.userDeleted(event, context);

      expect(retryProvider.publishRetry).toHaveBeenCalledWith(message, 1);
      expect(channel.ack).toHaveBeenCalledWith(message);
    });

    it('deve rejeitar a mensagem (nack) sem reenfileirar quando atingir o limite de retentativas', async () => {
      message.properties.headers = { 'x-retry-count': 3 };
      readerService.handleUserDeleted.mockRejectedValue(new Error('falhou'));

      await readerConsumer.userDeleted(event, context);

      expect(channel.nack).toHaveBeenCalledWith(message, false, false);
    });
  });
});

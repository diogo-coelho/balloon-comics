import { RmqContext } from '@nestjs/microservices';

import { ReaderConsumer } from '../reader.consumer';
import { ReaderService } from '../reader.service';
import { IntegrationEvent } from '../../auth/dtos/request/integration-event.dto';
import { UserQueueDto } from '../dtos/request/user-queue.dto';

describe('ReaderConsumer', () => {
  let readerConsumer: ReaderConsumer;
  let readerService: jest.Mocked<ReaderService>;
  let channel: { ack: jest.Mock; nack: jest.Mock };
  let context: RmqContext;

  const event: IntegrationEvent<UserQueueDto> = {
    eventId: 'event-id',
    eventType: 'auth.user.created.v1',
    aggregateId: 'user-id',
    occurredAt: new Date().toISOString(),
    version: 1,
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

    channel = { ack: jest.fn(), nack: jest.fn() };
    const message = { content: Buffer.from('') };

    context = {
      getChannelRef: () => channel,
      getMessage: () => message,
    } as unknown as RmqContext;

    readerConsumer = new ReaderConsumer(readerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('userCreated', () => {
    it('deve confirmar a mensagem (ack) quando o processamento for bem-sucedido', async () => {
      readerService.handleUserCreated.mockResolvedValue(undefined);

      await readerConsumer.userCreated(event, context);

      expect(readerService.handleUserCreated).toHaveBeenCalledWith(event);
      expect(channel.ack).toHaveBeenCalledWith(context.getMessage());
      expect(channel.nack).not.toHaveBeenCalled();
    });

    it('deve rejeitar a mensagem (nack) sem reenfileirar quando o processamento falhar', async () => {
      readerService.handleUserCreated.mockRejectedValue(new Error('falhou'));

      await readerConsumer.userCreated(event, context);

      expect(channel.nack).toHaveBeenCalledWith(
        context.getMessage(),
        false,
        false,
      );
      expect(channel.ack).not.toHaveBeenCalled();
    });
  });

  describe('userUpdated', () => {
    it('deve confirmar a mensagem (ack) quando o processamento for bem-sucedido', async () => {
      readerService.handleUserUpdated.mockResolvedValue(undefined);

      await readerConsumer.userUpdated(event, context);

      expect(readerService.handleUserUpdated).toHaveBeenCalledWith(event);
      expect(channel.ack).toHaveBeenCalledWith(context.getMessage());
    });

    it('deve rejeitar a mensagem (nack) sem reenfileirar quando o processamento falhar', async () => {
      readerService.handleUserUpdated.mockRejectedValue(new Error('falhou'));

      await readerConsumer.userUpdated(event, context);

      expect(channel.nack).toHaveBeenCalledWith(
        context.getMessage(),
        false,
        false,
      );
    });
  });

  describe('userDeleted', () => {
    it('deve confirmar a mensagem (ack) quando o processamento for bem-sucedido', async () => {
      readerService.handleUserDeleted.mockResolvedValue(undefined);

      await readerConsumer.userDeleted(event, context);

      expect(readerService.handleUserDeleted).toHaveBeenCalledWith(event);
      expect(channel.ack).toHaveBeenCalledWith(context.getMessage());
    });

    it('deve rejeitar a mensagem (nack) sem reenfileirar quando o processamento falhar', async () => {
      readerService.handleUserDeleted.mockRejectedValue(new Error('falhou'));

      await readerConsumer.userDeleted(event, context);

      expect(channel.nack).toHaveBeenCalledWith(
        context.getMessage(),
        false,
        false,
      );
    });
  });
});

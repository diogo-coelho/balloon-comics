import { Channel, Message } from 'amqplib';
import { Controller, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import type { IntegrationEvent } from '../../../../../application/messaging/contracts/integration-event.contract';
import { RabbitMqRetryProvider } from '../../rabbitmq-retry.provider';
import {
  UserCreatedEventData,
  UserDeletedEventData,
  UserUpdatedEventData,
} from '../../../../../application/types/user-sync';
import { UpdateReaderFromUserEventUseCase } from '../../../../../application/reader/use-cases/update-reader-from-user-event.use-case';
import { DeleteReaderFromUserEventUseCase } from '../../../../../application/reader/use-cases/delete-reader-from-user-event.use-case';
import { CreateReaderFromUserEventUseCase } from '../../../../../application/reader/use-cases/create-reader-from-user-event.use-case';
import { AUTH_ROUTING_KEYS } from '../../../event-routing-mapper';

@Controller()
export class ReaderConsumer {
  private readonly logger = new Logger(ReaderConsumer.name);

  constructor(
    private readonly createReaderFromUserEvent: CreateReaderFromUserEventUseCase,
    private readonly updateReaderFromUserEvent: UpdateReaderFromUserEventUseCase,
    private readonly deleteReaderFromUserEvent: DeleteReaderFromUserEventUseCase,
    private readonly retryProvider: RabbitMqRetryProvider,
    private readonly configService: ConfigService,
  ) {}

  @EventPattern(AUTH_ROUTING_KEYS.USER_CREATED)
  async userCreated(
    @Payload() event: IntegrationEvent<UserCreatedEventData>,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    await this.process(context, () =>
      this.createReaderFromUserEvent.execute(event),
    );
  }

  @EventPattern(AUTH_ROUTING_KEYS.USER_UPDATED)
  async userUpdated(
    @Payload() event: IntegrationEvent<UserUpdatedEventData>,
    @Ctx() context: RmqContext,
  ) {
    await this.process(context, () =>
      this.updateReaderFromUserEvent.execute(event),
    );
  }

  @EventPattern(AUTH_ROUTING_KEYS.USER_DELETED)
  async userDeleted(
    @Payload() event: IntegrationEvent<UserDeletedEventData>,
    @Ctx() context: RmqContext,
  ) {
    await this.process(context, () =>
      this.deleteReaderFromUserEvent.execute(event),
    );
  }

  private async process(
    context: RmqContext,
    handler: () => Promise<void>,
  ): Promise<void> {
    const channel = context.getChannelRef() as Channel;
    const message = context.getMessage() as Message;

    try {
      await handler();
      channel.ack(message);
    } catch (error: Error | any | undefined) {
      this.logger.error(
        'Erro ao processar mensagem RabbitMQ',
        error instanceof Error ? error.stack : undefined,
      );
      await this.retryMessage(message, channel);
    }
  }

  private async retryMessage(
    message: Message,
    channel: Channel,
  ): Promise<void> {
    const currentRetryCount = Number(
      message.properties.headers?.['x-retry-count'] ?? 0,
    );

    const maxRetries = this.configService.getOrThrow<number>(
      'RABBITMQ_MAX_RETRIES',
    );

    if (currentRetryCount < maxRetries) {
      try {
        await this.retryProvider.publishRetry(message, currentRetryCount + 1);
        channel.ack(message);
        return;
      } catch (error: Error | any | undefined) {
        this.logger.error(
          'Falha ao publicar mensagem na retry queue',
          error instanceof Error ? error.stack : undefined,
        );
        channel.nack(message, false, true);
        return;
      }
    }

    channel.nack(message, false, false);
  }
}

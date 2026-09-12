import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

import { ROUTING_KEYS } from './constants/routing-keys.constant';
import { ReaderService } from './reader.service';
import { UserQueueDto } from './dtos/request/user-queue.dto';
import type { IntegrationEvent } from '../auth/dtos/request/integration-event.dto';
import { ConfigService } from '@nestjs/config';
import { RabbitMqRetryProvider } from '../config/rabbitmq-retry.provider';

@Controller()
export class ReaderConsumer {
  private readonly logger = new Logger(ReaderConsumer.name);

  constructor(
    private readonly readerService: ReaderService,
    private readonly retryProvider: RabbitMqRetryProvider,
    private readonly configService: ConfigService,
  ) {}

  @EventPattern(ROUTING_KEYS.USER_CREATED)
  async userCreated(
    @Payload() event: IntegrationEvent<UserQueueDto>,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    await this.process(context, () =>
      this.readerService.handleUserCreated(event),
    );
  }

  @EventPattern(ROUTING_KEYS.USER_UPDATED)
  async userUpdated(
    @Payload() event: IntegrationEvent<UserQueueDto>,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    await this.process(context, () =>
      this.readerService.handleUserUpdated(event),
    );
  }

  @EventPattern(ROUTING_KEYS.USER_DELETED)
  async userDeleted(
    @Payload() event: IntegrationEvent<UserQueueDto>,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    await this.process(context, () =>
      this.readerService.handleUserDeleted(event),
    );
  }

  private async process(
    context: RmqContext,
    handler: () => Promise<void>,
  ): Promise<void> {
    const channel = context.getChannelRef();
    const message = context.getMessage();

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
    message: Record<string, any>,
    channel: any,
  ): Promise<void> {

    const currentRetryCount = Number(
      message.properties.headers?.[
        'x-retry-count'
      ] ?? 0,
    );

    const maxRetries = this.configService.getOrThrow<number>('RABBITMQ_MAX_RETRIES');

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

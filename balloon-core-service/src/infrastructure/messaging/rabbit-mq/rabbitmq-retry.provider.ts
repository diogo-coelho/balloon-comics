import * as amqpConnectionManager from 'amqp-connection-manager';
import type { Channel, Message } from 'amqplib';
import { randomUUID } from 'crypto';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getMessageHeaders, getStringMessageProperty } from './messaging';

@Injectable()
export class RabbitMqRetryProvider implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqRetryProvider.name);
  private connection!: amqpConnectionManager.AmqpConnectionManager;
  private channel!: amqpConnectionManager.ChannelWrapper;
  private readonly unroutedCorrelationIds = new Set<string>();

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const url = this.configService.getOrThrow<string>('RABBITMQ_URL');
    const retryExchange = this.configService.getOrThrow<string>(
      'RABBITMQ_RETRY_EXCHANGE',
    );

    this.connection = amqpConnectionManager.connect([url], {
      heartbeatIntervalInSeconds: 30,
      reconnectTimeInSeconds: 5,
    });

    this.channel = this.connection.createChannel({
      confirm: true,
      publishTimeout: 10_000,

      setup: async (channel: Channel) => {
        await channel.assertExchange(retryExchange, 'topic', { durable: true });

        channel.on('return', (message: Message) => {
          const correlationId = getStringMessageProperty(
            message.properties,
            'correlationId',
          );
          if (correlationId) {
            this.unroutedCorrelationIds.add(correlationId);
          }

          const messageId = getStringMessageProperty(
            message.properties,
            'messageId',
          );

          this.logger.warn(
            `Mensagem sem rota válida na retry exchange: routingKey="${message.fields.routingKey}", messageId="${messageId}"`,
          );
        });
      },
    });
  }

  async publishRetry(message: Message, retryCount: number): Promise<void> {
    const retryExchange = this.configService.getOrThrow<string>(
      'RABBITMQ_RETRY_EXCHANGE',
    );
    const correlationId = randomUUID();
    const messageId = getStringMessageProperty(message.properties, 'messageId');
    const type = getStringMessageProperty(message.properties, 'type');
    const contentType = getStringMessageProperty(
      message.properties,
      'contentType',
    );

    await this.channel.publish(
      retryExchange,
      message.fields.routingKey,
      message.content,
      {
        persistent: true,
        mandatory: true,
        correlationId,
        messageId,
        type,
        contentType,
        headers: {
          ...getMessageHeaders(message.properties),
          'x-retry-count': retryCount,
        },
      },
    );

    if (this.unroutedCorrelationIds.delete(correlationId)) {
      throw new Error(
        `Mensagem de retry sem rota válida na exchange "${retryExchange}" (routingKey="${message.fields.routingKey}")`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}

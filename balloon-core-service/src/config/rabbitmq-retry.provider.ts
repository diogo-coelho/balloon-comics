import * as amqpConnectionManager from 'amqp-connection-manager';
import type { Message } from 'amqplib';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RabbitMqRetryProvider
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RabbitMqRetryProvider.name);
  private connection!: amqpConnectionManager.AmqpConnectionManager;
  private channel!: amqpConnectionManager.ChannelWrapper;

  constructor(
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    const url = this.configService.getOrThrow<string>('RABBITMQ_URL');
    const retryExchange = this.configService.getOrThrow<string>('RABBITMQ_RETRY_EXCHANGE');

    this.connection =  amqpConnectionManager.connect(
      [url], { heartbeatIntervalInSeconds: 30, reconnectTimeInSeconds: 5 });
      
    this.channel = this.connection.createChannel({
      confirm: true,
      publishTimeout: 10_000,

      setup: async (channel) => {
        await channel.assertExchange(
          retryExchange,
          'topic',
          { durable: true },
        );

        channel.on('return', (message: Message) => {
          this.logger.warn(
            `Mensagem sem rota válida na retry exchange: routingKey="${message.fields.routingKey}", messageId="${message.properties?.messageId}"`,
          );
        });
      },
    });
  }

  async publishRetry(
    message: Record<string, any>,
    retryCount: number,
  ): Promise<void> {
    const retryExchange = this.configService.getOrThrow<string>('RABBITMQ_RETRY_EXCHANGE');

    await this.channel.publish(
      retryExchange,
      message.fields.routingKey,
      message.content,
      {
        persistent: true,
        mandatory: true,
        messageId: message.properties.messageId,
        type: message.properties.type,
        contentType: message.properties.contentType,
        headers: {
          ...message.properties.headers,
          'x-retry-count': retryCount,
        },
      },
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}
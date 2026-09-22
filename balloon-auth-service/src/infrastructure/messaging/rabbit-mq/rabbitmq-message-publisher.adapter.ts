import * as amqpConnectionManager from 'amqp-connection-manager';
import type { Channel, Message } from 'amqplib';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AUTH_EXCHANGE } from './event-routing-mapper';
import { IntegrationEventContract } from '../../../application/messaging/integration-event.contract';

@Injectable()
export class RabbitMQProvider implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQProvider.name);
  private connection!: amqpConnectionManager.AmqpConnectionManager;
  private channel!: amqpConnectionManager.ChannelWrapper;
  private readonly returnedMessages = new Set<string>();

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    try {
      const connectionUrl =
        this.configService.getOrThrow<string>('RABBITMQ_URL');

      this.connection = amqpConnectionManager.connect(connectionUrl, {
        heartbeatIntervalInSeconds: 30,
        reconnectTimeInSeconds: 5,
      });
      this.handleConnectionLogging();

      this.channel = this.connection.createChannel({
        json: false,
        confirm: true,
        publishTimeout: 10_000,
        setup: async (channel: Channel) => {
          await channel.assertExchange(AUTH_EXCHANGE, 'topic', {
            durable: true,
          });

          channel.on('return', (message: Message) => {
            const messageId: unknown = message.properties.messageId;
            if (typeof messageId === 'string') {
              this.returnedMessages.add(messageId);
            }
          });
        },
      });
    } catch (error: unknown) {
      this.logger.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }

  async publish(
    exchange: string,
    routingKey: string,
    event: IntegrationEventContract,
  ): Promise<void> {
    const packet = {
      pattern: routingKey,
      data: event,
    };

    await this.channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(packet)),
      {
        persistent: true,
        mandatory: true,
        messageId: event.eventId,
        type: routingKey,
        contentType: 'application/json',
      },
    );

    if (this.returnedMessages.delete(event.eventId)) {
      throw new Error(
        `Mensagem ${event.eventId} não possui rota RabbitMQ válida`,
      );
    }
  }

  private handleConnectionLogging() {
    this.connection.on('connect', () => {
      this.logger.log('Conectado ao RabbitMQ');
    });

    this.connection.on('disconnect', (err) => {
      this.logger.error('Desconectado do RabbitMQ', err);
    });

    this.connection.on('error', (err) => {
      this.logger.error('Erro na conexão com RabbitMQ', err);
    });
  }
}

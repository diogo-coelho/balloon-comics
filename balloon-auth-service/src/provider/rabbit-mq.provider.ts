import * as amqpConnectionManager from 'amqp-connection-manager';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AUTH_EXCHANGE } from '../constants/routing-keys';
import { IntegrationEventContract } from '../contracts/integration-event.contract';

@Injectable()
export class RabbitMQProvider implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQProvider.name);
  private connection!: amqpConnectionManager.AmqpConnectionManager;
  private channel!: amqpConnectionManager.ChannelWrapper;
  private readonly returnedMessages = new Set<string>();

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    try {
      const connectionUrl = this.configService.getOrThrow<string>(
        'RABBITMQ_URL',
      ) as string;

      this.connection = await amqpConnectionManager.connect(connectionUrl, 
        { 
          heartbeatIntervalInSeconds: 30, 
          reconnectTimeInSeconds: 5 
        });
      this.handleConnectionLogging();

      this.channel = await this.connection?.createChannel(
        { 
          json: false, 
          setup: async (channel) => {
            await channel.assertExchange(AUTH_EXCHANGE, 'topic',
              { durable: true });

            channel.on('return', (message) => {
              const messageId = message.properties.messageId;
              if (messageId) {
                this.returnedMessages.add(messageId);
              }
            });
          },
        });
      
    } catch (error: Error | undefined | any) {
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

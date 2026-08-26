import * as amqp from "amqplib";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AUTH_EXCHANGE } from "../constants/routing-keys";
import { IntegrationEventContract } from "../contracts/integration-event.contract";

@Injectable()
export class RabbitMQProvider implements OnModuleInit {

  private connection!: amqp.ChannelModel;
  private channel!: amqp.ConfirmChannel;
  private readonly returnedMessages = new Set<string>();

  constructor(private readonly configService: ConfigService) {}
  
  async onModuleInit() {
    try {
      const connectionUrl = this.configService.getOrThrow<string>("RABBITMQ_URL") as string;
      this.connection = await amqp.connect(connectionUrl);      
      this.channel = await this.connection?.createConfirmChannel();
      await this.channel.assertExchange(AUTH_EXCHANGE, "topic", { durable: true });
      this.channel.on('return', (message) => {
        const messageId =
          message.properties.messageId;

        if (messageId) {
          this.returnedMessages.add(messageId);
        }
      });
    } catch (error: Error | undefined | any) {
      console.error("Failed to connect to RabbitMQ:", error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }

  async publish(exchange: string, routingKey: string, event: IntegrationEventContract): Promise<void> {
    const packet = {
      pattern: routingKey,
      data: event,
    };

    const confirmPromise = new Promise<void>((resolve, reject) => {
        const writable = this.channel.publish(
            exchange,
            routingKey,
            Buffer.from(
              JSON.stringify(packet),
            ),
            {
              persistent: true,
              mandatory: true,
              messageId: event.eventId,
              type: routingKey,
              contentType: 'application/json',
            },(error) => {
              if (error) {
                reject(error);
                return;
              }
              resolve();
            },
          );

          if (!writable) {
            this.channel.once('drain', () => {
              console.log('Channel drained, resuming publish...');
            });
          }
      });

    await confirmPromise;

    if (this.returnedMessages.delete(event.eventId)) {
      throw new Error(
        `Mensagem ${event.eventId} não possui rota RabbitMQ válida`,
      );
    }
  }

}
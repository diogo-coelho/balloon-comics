import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as amqp from "amqplib";

@Injectable()
export class RabbitMQProvider implements OnModuleInit {

  private connection!: amqp.ChannelModel;
  private channel!: amqp.ConfirmChannel;

  constructor(private readonly configService: ConfigService) {}
  
  async onModuleInit() {
    try {
      const connectionUrl = this.configService.getOrThrow<string>("RABBITMQ_URL") as string;
      this.connection = await amqp.connect(connectionUrl);
      
      this.channel = await this.connection?.createConfirmChannel();

      await this.channel.assertExchange("auth_exchange", "topic", { durable: true });

    } catch (error) {
      console.error("Failed to connect to RabbitMQ:", error);
      throw error;
    }
  }

  async publish(exchange: string, routingKey: string, message: unknown): Promise<void> {
    const newMessage = {
      pattern: routingKey,
      data: message
    }

    this.channel.publish(
      exchange, 
      routingKey, 
      Buffer.from(JSON.stringify(newMessage)), 
      { persistent: true }
    );

    const published = this.channel.publish(
      exchange, 
      routingKey, 
      Buffer.from(JSON.stringify(newMessage)), 
      { persistent: true }
    );

    if (!published) {
      await new Promise<void>((resolve) => {
        this.channel.once('drain', resolve);
      });
    }

    await this.channel.waitForConfirms();
  }

}
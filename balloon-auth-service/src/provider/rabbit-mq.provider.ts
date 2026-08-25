import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config/dist/config.service";
import * as amqp from "amqplib";

@Injectable()
export class RabbitMQProvider implements OnModuleInit {

  private connection!: amqp.ChannelModel;
  private channel!: amqp.Channel;

  constructor(private readonly configService: ConfigService) {}
  
  async onModuleInit() {
    try {
      const connectionUrl = this.configService.getOrThrow<string>("RABBITMQ_URL") as string;
      this.connection = await amqp.connect(connectionUrl);
      
      this.channel = await this.connection?.createChannel();

      await this.channel.assertExchange("auth_exchange", "topic", { durable: true });

    } catch (error) {
      console.error("Failed to connect to RabbitMQ:", error);
      throw error;
    }
  }

  publish(exchange: string, routingKey: string, message: unknown) {
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
  }

}
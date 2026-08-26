import * as amqp from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

export async function setupRabbitMQ(
  configService: ConfigService,
): Promise<MicroserviceOptions> {
  const url = configService.getOrThrow<string>('RABBITMQ_URL');
  const queueKey = configService.getOrThrow<string>('RABBITMQ_QUEUE_KEY');
  const exchange = configService.getOrThrow<string>('RABBITMQ_EXCHANGE');
  const queue = configService.getOrThrow<string>('RABBITMQ_QUEUE');

  const deadLetterExchange = configService.getOrThrow<string>(
    'RABBITMQ_DEAD_LETTER_EXCHANGE',
  );
  const deadLetterRoutingKey = configService.getOrThrow<string>(
    'RABBITMQ_DEAD_LETTER_ROUTING_KEY',
  );
  const dlq = `${queue}.dlq`;

  // 1. Asserta a topologia (Exchanges, DLX, DLQ e Binds) via amqplib
  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();

  await channel.assertExchange(exchange, 'topic', { durable: true });
  await channel.assertExchange(deadLetterExchange, 'direct', { durable: true });

  await channel.assertQueue(dlq, { durable: true });
  await channel.bindQueue(dlq, deadLetterExchange, deadLetterRoutingKey);

  await channel.assertQueue(queue, {
    durable: true,
    deadLetterExchange,
    deadLetterRoutingKey,
  });
  await channel.bindQueue(queue, exchange, queueKey);

  await channel.close();
  await connection.close();

  return {
    transport: Transport.RMQ,
    options: {
      urls: [url],
      exchange,
      exchangeType: 'topic',
      routingKey: queueKey,
      queue,
      noAck: false,
      queueOptions: {
        durable: true,
        deadLetterExchange,
        deadLetterRoutingKey,
      },
    },
  };
}

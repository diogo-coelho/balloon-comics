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
  const retryExchange = configService.getOrThrow<string>(
    'RABBITMQ_RETRY_EXCHANGE',
  );
  const retryQueue = configService.getOrThrow<string>(
    'RABBITMQ_RETRY_QUEUE',
  );
  const retryDelay = configService.getOrThrow<number>(
    'RABBITMQ_RETRY_DELAY_MS',
  );
  const dlq = `${queue}.dlq`;

  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();

  await channel.assertExchange(exchange, 'topic', { durable: true });
  await channel.assertExchange(deadLetterExchange, 'direct', { durable: true });
  await channel.assertExchange(retryExchange, 'topic', { durable: true});

  await channel.assertQueue(dlq, { durable: true });
  await channel.bindQueue(dlq, deadLetterExchange, deadLetterRoutingKey);
  
  await channel.assertQueue(retryQueue, { durable: true, messageTtl: retryDelay, deadLetterExchange: exchange });
  await channel.bindQueue(retryQueue, retryExchange, '#');

  await channel.assertQueue(queue, { durable: true, deadLetterExchange, deadLetterRoutingKey });
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

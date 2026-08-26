import * as amqp from 'amqplib';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export async function configureRabbitTopology(app: INestApplication) {
  const configService = app.get(ConfigService);
    
  const rabbitMQUrl = configService.getOrThrow<string>('RABBITMQ_URL');
  const rabbitMQQueueKey = configService.getOrThrow<string>('RABBITMQ_QUEUE_KEY');
  const rabbitMQExchange = configService.getOrThrow<string>('RABBITMQ_EXCHANGE');
  const rabbitMQQueue = configService.getOrThrow<string>('RABBITMQ_QUEUE');
  
  const rabbitMQDeadLetterExchange = configService.getOrThrow<string>('RABBITMQ_DEAD_LETTER_EXCHANGE');
  const rabbitMQDeadLetterRoutingKey = configService.getOrThrow<string>('RABBITMQ_DEAD_LETTER_ROUTING_KEY');

  const connection = await amqp.connect(rabbitMQUrl);
  const channel = await connection.createChannel();
  const exchange = rabbitMQExchange;
  const queue = rabbitMQQueue;
  const dlx = rabbitMQDeadLetterExchange;
  const dlq = `${rabbitMQQueue}.dlq`;

  await channel.assertExchange(exchange, 'topic', {
      durable: true,
    },
  );

  await channel.assertExchange(dlx, 'direct', {
      durable: true,
    },
  );

  await channel.assertQueue(dlq, {
      durable: true,
    },
  );

  await channel.bindQueue(dlq, dlx,
    rabbitMQDeadLetterRoutingKey,
  );

  await channel.assertQueue(queue,
    {
      durable: true,
      deadLetterExchange: dlx,
      deadLetterRoutingKey: rabbitMQDeadLetterRoutingKey,
    },
  );

  await channel.bindQueue(queue, exchange,
    rabbitMQQueueKey,
  );

  await channel.close();
  await connection.close();
}
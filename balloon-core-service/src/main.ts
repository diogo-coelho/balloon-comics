import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { configureRabbitTopology } from './config/rabbitmq-topology.config';

import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  const rabbitMQUrl = configService.getOrThrow<string>('RABBITMQ_URL');
  const rabbitMQQueueKey = configService.getOrThrow<string>('RABBITMQ_QUEUE_KEY');
  const rabbitMQExchange = configService.getOrThrow<string>('RABBITMQ_EXCHANGE');
  const rabbitMQQueue = configService.getOrThrow<string>('RABBITMQ_QUEUE');

  const rabbitMQDeadLetterExchange = configService.getOrThrow<string>('RABBITMQ_DEAD_LETTER_EXCHANGE');
  const rabbitMQDeadLetterRoutingKey = configService.getOrThrow<string>('RABBITMQ_DEAD_LETTER_ROUTING_KEY');

  await configureRabbitTopology(app);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitMQUrl],
      exchange: rabbitMQExchange,
      exchangeType: 'topic',
      routingKey: rabbitMQQueueKey,
      queue: rabbitMQQueue,
      noAck: false,
      queueOptions: {
        durable: true,
        deadLetterExchange: rabbitMQDeadLetterExchange,
        deadLetterRoutingKey: rabbitMQDeadLetterRoutingKey,
      }
    }
  });

  await app.startAllMicroservices();

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }));
  
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();

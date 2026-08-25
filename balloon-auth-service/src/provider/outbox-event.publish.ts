import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Interval } from '@nestjs/schedule';
import { Repository } from "typeorm";

import { OutboxEventEntity } from "../user/entities/outbox-event.entity";
import { RabbitMQProvider } from "./rabbit-mq.provider";

@Injectable()
export class OutboxEventsPublisher {

  private readonly logger = new Logger(OutboxEventsPublisher.name);
  private isPublishing = false;
  
  constructor(
    @InjectRepository(OutboxEventEntity)
    private readonly outboxRepository: Repository<OutboxEventEntity>,
    private readonly rabbitMqProvider: RabbitMQProvider,
  ) {}

  @Interval('publish-outbox-events', 5_000)
  async publishPendingEvents(): Promise<void> {
    if (this.isPublishing) {
      return;
    }

    this.isPublishing = true;

    try {
      const pendingEvents = await this.outboxRepository.find({
        where: { status: 'pending' },
        order: { createdAt: 'ASC' },
        take: 100,
      });

      for (const event of pendingEvents) {
        await this.publishEvent(event);
      }
    } finally {
      this.isPublishing = false;
    }
  }

  private async publishEvent(event: OutboxEventEntity): Promise<void> {
    try {
      await this.rabbitMqProvider.publish(
        'auth_exchange',
        event.eventType!,
        event.payload!,
      );

      await this.outboxRepository.update(event.id!, {
        status: 'published',
        attempts: (event.attempts ?? 0) + 1,
        updatedAt: new Date(),
      });
    } catch (error: Error | undefined | any) {
      const nextAttempts = (event.attempts ?? 0) + 1;

      await this.outboxRepository.update(event.id!, {
        attempts: nextAttempts,
        status: nextAttempts >= 10 ? 'failed' : 'pending',
      });

      this.logger.error(
        `Falha ao publicar o evento ${event.id}; tentativa ${nextAttempts}.`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
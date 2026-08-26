import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Interval } from '@nestjs/schedule';
import { Brackets, DataSource, Repository } from "typeorm";

import { OutboxEventEntity } from "../user/entities/outbox-event.entity";
import { RabbitMQProvider } from "./rabbit-mq.provider";
import { IntegrationEventContract } from "../contracts/integration-event.contract";
import { AUTH_EXCHANGE } from "../constants/routing-keys";

@Injectable()
export class OutboxEventsPublisher {

  private readonly logger = new Logger(OutboxEventsPublisher.name);
  private isPublishing = false;
  
  constructor(
    @InjectRepository(OutboxEventEntity)
    private readonly outboxRepository: Repository<OutboxEventEntity>,
    private readonly dataSource: DataSource,
    private readonly rabbitMqProvider: RabbitMQProvider,
  ) {}

  @Interval('publish-outbox-events', 5_000)
  async publishPendingEvents(): Promise<void> {
    if (this.isPublishing) {
      return;
    }

    this.isPublishing = true;

    try {
      const events = await this.claimEvents();

      for (const event of events) {
        await this.publishEvent(event);
      }
    } finally {
      this.isPublishing = false;
    }
  }

  private async publishEvent(event: OutboxEventEntity): Promise<void> {
    const message: IntegrationEventContract = {
      eventId: event.id!,
      eventType: event.eventType!,
      aggregateId: event.userId!,
      occurredAt: event.createdAt!.toISOString(),
      version: 1,
      data: event.payload!,
    };

    try {
      await this.rabbitMqProvider.publish(
        AUTH_EXCHANGE,
        event.eventType!,
        message,
      );

      await this.outboxRepository.update(event.id!, {
        status: 'published',
        publishedAt: new Date(),
        lockedAt: null,
        lastError: null,
      });
      
    } catch (error: Error | undefined | any) {
      const attempts = event.attempts ?? 1;

      await this.outboxRepository.update(event.id!, {
        status: attempts >= 10
          ? 'failed'
          : 'pending',

        lockedAt: null,

        lastError:
          error instanceof Error
            ? error.message
            : String(error),
      });

      this.logger.error(
        `Falha ao publicar evento ${event.id}. Tentativa ${attempts}.`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private async claimEvents(): Promise<OutboxEventEntity[]> {
    const staleBefore = new Date(Date.now() - 2 * 60 * 1000);

    return this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(OutboxEventEntity);

      const events = await repository
        .createQueryBuilder('event')
        .setLock('pessimistic_write')
        .setOnLocked('skip_locked')
        .where(
          new Brackets((query) => {
            query
              .where('event.status = :pending', {
                pending: 'pending',
              })
              .orWhere(
                `
                  event.status = :processing
                  AND event.lockedAt < :staleBefore
                `,
                {
                  processing: 'processing',
                  staleBefore,
                },
              );
          }),
        )
        .orderBy('event.createdAt', 'ASC')
        .take(100)
        .getMany();

      if (events.length === 0) {
        return [];
      }

      const now = new Date();

      for (const event of events) {
        event.status = 'processing';
        event.lockedAt = now;
        event.attempts = (event.attempts ?? 0) + 1;
      }

      await repository.save(events);

      return events;
    });
  }
}
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Interval } from '@nestjs/schedule';
import { Brackets, DataSource, In, Repository } from 'typeorm';

import { OutboxEventEntity } from '../user/entities/outbox-event.entity';
import { RabbitMQProvider } from './rabbit-mq.provider';
import { IntegrationEventContract } from '../contracts/integration-event.contract';
import { AUTH_EXCHANGE } from '../constants/routing-keys';

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
      if (events.length === 0) return;

      const successfulIds: string[] = [];
      const failedEvents: Array<{ event: OutboxEventEntity; error: any }> = [];

      for (const event of events) {
        try {
          await this.publishEvent(event);
          successfulIds.push(event.id!);
        }
        catch (error) {
          failedEvents.push({ event, error });
        }
      }

      await this.updateEventStatus(successfulIds, 'published');

      for (const { event, error } of failedEvents) {
        const attempts = (event.attempts ?? 0) + 1;

        await this.updateEventStatus(
          [event.id!],
          attempts >= 10 ? 'failed' : 'pending',
          error instanceof Error ? error.message : String(error),
        );

        this.logger.error(
          `Falha ao publicar evento ${event.id}. Tentativa ${attempts}.`,
          error instanceof Error ? error.stack : undefined,
        );
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

    await this.rabbitMqProvider.publish(
      AUTH_EXCHANGE,
      event.eventType!,
      message,
    );
  }

  private async updateEventStatus(eventIds: string[], status: 'pending' | 'published' | 'failed', lastError?: string): Promise<void> {
    if (eventIds.length > 0) {
      await this.outboxRepository.update(
        { id: In(eventIds) },
        {
          status: status,
          publishedAt: new Date(),
          lockedAt: null,
          lastError: lastError ?? null,
        },
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

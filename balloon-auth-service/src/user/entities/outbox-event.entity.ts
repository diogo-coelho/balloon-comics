import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('outbox_events')
export class OutboxEventEntity {

  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ name: 'user_id', nullable: true })
  userId?: string;

  @Column({ name: 'event_type' })
  eventType?: string;

  @Column({ type: 'jsonb' })
  payload?: Record<string, unknown>;

  @Column({ default: 'pending' })
  status?: 'pending' | 'processing' | 'published' | 'failed';

  @Column({ default: 0 })
  attempts?: number;

  @Column({ name: 'locked_at', type: 'timestamp', nullable: true })
  lockedAt?: Date | null;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt?: Date | null;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt?: Date;

}
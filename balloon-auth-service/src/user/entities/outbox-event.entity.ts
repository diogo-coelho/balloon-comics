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
  status?: 'pending' | 'published' | 'failed';

  @Column({ default: 0 })
  attempts?: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt?: Date;

}
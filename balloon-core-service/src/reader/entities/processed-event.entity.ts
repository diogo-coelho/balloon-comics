import {
  CreateDateColumn,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('processed_events')
@Index('uq_processed_event_consumer', ['eventId', 'consumer'], { unique: true })
export class ProcessedEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId!: string;

  @Column({ type: 'varchar', length: 100 })
  consumer!: string;

  @CreateDateColumn({ name: 'processed_at', type: 'timestamp' })
  processedAt!: Date;
}

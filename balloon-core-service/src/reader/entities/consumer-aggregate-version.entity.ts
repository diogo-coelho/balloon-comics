import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('consumer_aggregate_versions')
@Index(
  'uq_consumer_aggregate_version',
  ['aggregateId', 'consumer'],
  { unique: true },
)
export class ConsumerAggregateVersionEntity {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'aggregate_id',
    type: 'uuid',
  })
  aggregateId!: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  consumer!: string;

  @Column({
    name: 'last_applied_version',
    type: 'int',
    default: 0,
  })
  lastAppliedVersion!: number;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
  })
  updatedAt!: Date;
}
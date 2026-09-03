import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ReaderEntity } from '../../reader/entities/reader.entity';

@Entity('age_verifications')
export class AgeVerificationEntity {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => ReaderEntity, (reader) => reader.ageVerification, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reader_id', referencedColumnName: 'id' })
  reader!: ReaderEntity;

  @Column({ name: 'has_legal_age', type: 'boolean', nullable: false })
  hasLegalAge!: boolean;

  @Column({ name: 'date_of_birth', type: 'date', nullable: false })
  dateOfBirth!: Date;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;
}
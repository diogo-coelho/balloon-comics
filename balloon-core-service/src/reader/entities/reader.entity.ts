import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('readers')
export class ReaderEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ name: 'user_id', unique: true, type: 'uuid', nullable: false })
  userId?: string;

  @Column({ unique: true, type: 'varchar', length: 100, nullable: false })
  email?: string;

  @Column({ unique: true, type: 'varchar', length: 200, nullable: false })
  username?: string;

  @Column({ type: 'varchar', length: 150 })
  name?: string;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt?: Date;
}
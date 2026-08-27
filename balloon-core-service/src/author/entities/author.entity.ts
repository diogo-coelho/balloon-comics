import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { AuthorStatusEnum } from "../enum/status.enum";
import { ReaderEntity } from "../../reader/entities/reader.entity";

@Entity('authors')
export class AuthorEntity {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'pen_name', unique: true, type: 'varchar', length: 255, nullable: false })
  penName!: string;

  @Column({ name: 'biography', type: 'text', nullable: true })
  biography?: string;

  @Column({ name: 'website', type: 'varchar', length: 255, nullable: true })
  website?: string;

  @Column({ name: 'status', type: 'enum', enum: AuthorStatusEnum, default: AuthorStatusEnum.ACTIVE })
  status!: AuthorStatusEnum;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  @OneToOne(() => ReaderEntity, (reader) => reader.author, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reader_id', referencedColumnName: 'id' })
  reader!: ReaderEntity;

}
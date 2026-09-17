import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ReaderOrmEntity } from './reader.orm-entity';
import { SocialMediaTypeEnum } from '../../../../domain/social-media-link/enums/social-media-type.enum';

@Entity('social_media_links')
@Unique(['reader', 'name'])
export class SocialMediaLinkOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  
  @ManyToOne(() => ReaderOrmEntity, (reader) => reader.socialMediaLinks, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reader_id', referencedColumnName: 'id' })
  reader!: ReaderOrmEntity;
  
  @Column({ type: 'enum', enum: SocialMediaTypeEnum, nullable: false })
  name!: string;
  
  @Column({ type: 'varchar', nullable: false })
  url!: string;
  
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
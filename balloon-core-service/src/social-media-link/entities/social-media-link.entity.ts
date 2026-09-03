import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from "typeorm";
import { ReaderEntity } from "../../reader/entities/reader.entity";
import { SocialMediaTypeEnum } from "../enums/social-media-type.enum";

@Entity('social_media_links')
@Unique(['reader', 'name'])
export class SocialMediaLinkEntity {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => ReaderEntity, (reader) => reader.socialMediaLinks, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reader_id', referencedColumnName: 'id' })
  reader!: ReaderEntity;

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
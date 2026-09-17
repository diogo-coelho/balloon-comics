import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AgeVerificationOrmEntity } from './age-verification.orm-entity';
import { SocialMediaLinkOrmEntity } from './social-media-link.orm-entity';
import { AuthorOrmEntity } from './author.orm-entity';

@Entity('readers')
export class ReaderOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  
  @Column({ name: 'user_id', unique: true, type: 'uuid', nullable: false })
  userId!: string;
  
  @Column({ unique: true, type: 'varchar', length: 100, nullable: false })
  email!: string;
  
  @Column({ unique: true, type: 'varchar', length: 200, nullable: false })
  username!: string;
  
  @Column({ type: 'varchar', length: 150 })
  name?: string;
  
  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl?: string;
  
  @Column({ type: 'text', nullable: true })
  description?: string;
  
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
  
  @OneToOne(() => AuthorOrmEntity, (author) => author.reader)
  author?: AuthorOrmEntity;
  
  @OneToOne(
    () => AgeVerificationOrmEntity,
    (ageVerification) => ageVerification.reader,
  )
  ageVerification?: AgeVerificationOrmEntity;
  
  @OneToMany(
    () => SocialMediaLinkOrmEntity,
    (socialMediaLink) => socialMediaLink.reader,
  )
  socialMediaLinks?: SocialMediaLinkOrmEntity[];
}
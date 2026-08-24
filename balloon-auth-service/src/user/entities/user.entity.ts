import { 
  Column,
  CreateDateColumn, 
  Entity, 
  PrimaryGeneratedColumn, 
  UpdateDateColumn 
} from "typeorm";

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string;
  
  @Column({ unique: true, type: 'varchar', length: 200, nullable: false })
  username?: string;
  
  @Column({ unique: true, type: 'varchar', length: 100, nullable: false })
  email?: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: false })
  passwordHash?: string;
  
  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: Date;
  
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt?: Date;
}
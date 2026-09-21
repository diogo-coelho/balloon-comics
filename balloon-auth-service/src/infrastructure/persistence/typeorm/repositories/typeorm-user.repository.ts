import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepositoryPort } from '../../../../application/ports/user.repository.port';
import { User } from '../../../../domain/user/entities/user';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { UserOrmMapper } from '../mappers/user.orm-mapper';
import { Repository } from 'typeorm';

@Injectable()
export class TypeOrmUserRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.userRepository.findOneBy({ email });

    return entity ? UserOrmMapper.toDomain(entity) : null;
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.userRepository.findOneBy({
      id,
    });

    return entity ? UserOrmMapper.toDomain(entity) : null;
  }

  async findByIdForUpdate(id: string): Promise<User | null> {
    const entity = await this.userRepository.findOne({
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });

    return entity ? UserOrmMapper.toDomain(entity) : null;
  }

  async save(user: User): Promise<void> {
    const entity = UserOrmMapper.toPersistence(user);

    await this.userRepository.save(entity);
  }

  async delete(user: User): Promise<void> {
    await this.userRepository.delete({ id: user.id });
  }
}

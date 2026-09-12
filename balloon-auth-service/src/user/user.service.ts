import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { OutboxEventEntity } from './entities/outbox-event.entity';

import { HashingServiceProtocol } from '../auth/hashing/hashing.service';
import { AuthService } from '../auth/auth.service';
import { TokenPayloadDto } from '../auth/dtos/request/token-payload.dto';

import { CreateUserDto } from './dtos/request/create-user.dto';
import { UpdateUserDto } from './dtos/request/update-user.dto';
import { ResponseUpdatedUserDto } from './dtos/response/response-updated-user.dto';
import { ResponseUserDto } from './dtos/response/response-user.dto';

import { AUTH_ROUTING_KEYS } from '../constants/routing-keys';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
    private readonly hashingService: HashingServiceProtocol,
    private readonly authService: AuthService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<ResponseUserDto> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new ForbiddenException('Email informado já está em uso');
    }

    const passwordHash = await this.hashingService.hash(createUserDto.password);
    const user = await this.createUserTransaction(passwordHash, createUserDto);
    const nextUrl = await this.authService.getNextUrl('\/readers\/me');
    const { accessToken, refreshToken } =
      await this.authService.generateTokens(user);

    return {
      message: 'Usuário criado com sucesso',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
      accessToken,
      refreshToken,
      next: nextUrl,
    };
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
    tokenPayload: TokenPayloadDto,
  ): Promise<ResponseUpdatedUserDto> {
    const updatedUser = await this.updateUserTransaction(
      id,
      updateUserDto,
      tokenPayload,
    );

    return {
      message: 'Usuário atualizado com sucesso',
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    };
  }

  async deleteUser(id: string, tokenPayload: TokenPayloadDto): Promise<void> {
    await this.deleteUserTransaction(id, tokenPayload);
  }

  private async createUserTransaction(
    passwordHash: string,
    createUserDto: CreateUserDto,
  ): Promise<UserEntity> {
    return await this.dataSource.transaction(async (manager) => {
      const newUser = manager.create(UserEntity, {
        username: createUserDto.username,
        email: createUserDto.email,
        passwordHash,
        eventVersion: 1,
      });

      const savedUser = await manager.save(UserEntity, newUser);

      const outboxEvent = manager.create(OutboxEventEntity, {
        eventType: AUTH_ROUTING_KEYS.USER_CREATED,
        userId: savedUser.id,
        aggregateVersion: savedUser.eventVersion,
        payload: {
          userId: savedUser.id,
          username: savedUser.username,
          email: savedUser.email,
        },
        status: 'pending',
        attempts: 0,
      });

      await manager.save(OutboxEventEntity, outboxEvent);

      return savedUser;
    });
  }

  private async updateUserTransaction(
    id: string,
    updateUserDto: UpdateUserDto,
    tokenPayload: TokenPayloadDto,
  ): Promise<UserEntity> {
    return await this.dataSource.transaction(async (manager) => {
      const currentUser = await manager.findOne(UserEntity, 
        { where: { id }, 
        lock: {
          mode: 'pessimistic_write',
        }
      });

      if (!currentUser)
        throw new NotFoundException(`Usuário com ID ${id} não encontrado`);

      if (tokenPayload.sub !== currentUser.id) {
        throw new ForbiddenException(
          'Usuário não autorizado a atualizar este recurso',
        );
      }

      const usernameChanged =
        updateUserDto.username !== undefined &&
        updateUserDto.username !== currentUser.username;
      const emailChanged =
        updateUserDto.email !== undefined &&
        updateUserDto.email !== currentUser.email;

      const integrationDataChanged = usernameChanged || emailChanged;
      if (integrationDataChanged) {
        currentUser.eventVersion += 1;
      }

      currentUser.username = usernameChanged
        ? updateUserDto.username
        : currentUser.username;
      currentUser.email = emailChanged
        ? updateUserDto.email
        : currentUser.email;

      if (updateUserDto.password) {
        const passwordHash = await this.hashingService.hash(
          updateUserDto.password,
        );
        currentUser.passwordHash = passwordHash;
      }

      const updatedUser = await manager.save(UserEntity, currentUser);

      if (integrationDataChanged) {
        const outboxEvent = manager.create(OutboxEventEntity, {
          eventType: AUTH_ROUTING_KEYS.USER_UPDATED,
          userId: updatedUser.id,
          aggregateVersion: updatedUser.eventVersion,
          payload: {
            userId: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
          },
          status: 'pending',
          attempts: 0,
        });

        await manager.save(OutboxEventEntity, outboxEvent);
      }

      return updatedUser;
    });
  }

  private async deleteUserTransaction(
    id: string,
    tokenPayload: TokenPayloadDto,
  ): Promise<void> {
    return await this.dataSource.transaction(async (manager) => {
      const currentUser = await manager.findOne(UserEntity, 
        { where: { id }, 
        lock: {
          mode: 'pessimistic_write',
        }
      });
      if (!currentUser)
        throw new NotFoundException(`Usuário com ID ${id} não encontrado`);

      if (tokenPayload.sub !== currentUser.id) {
        throw new ForbiddenException(
          'Usuário não autorizado a deletar este recurso',
        );
      }

      const deleteVersion = currentUser.eventVersion + 1;
      await manager.remove(UserEntity, currentUser);

      const outboxEvent = manager.create(OutboxEventEntity, {
        eventType: AUTH_ROUTING_KEYS.USER_DELETED,
        userId: id,
        aggregateVersion: deleteVersion,
        payload: {
          userId: id,
        },
        status: 'pending',
        attempts: 0,
      });

      await manager.save(OutboxEventEntity, outboxEvent);
    });
  }
}

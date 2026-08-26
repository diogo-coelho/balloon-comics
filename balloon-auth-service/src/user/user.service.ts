import { ForbiddenException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { ConfigType } from '@nestjs/config';
import { UserEntity } from './entities/user.entity';
import { OutboxEventEntity } from './entities/outbox-event.entity';

import { HashingServiceProtocol } from '../auth/hashing/hashing.service';
import { AuthService } from '../auth/auth.service';
import jwtConfig from '../auth/config/jwt.config';
import { TokenPayloadDto } from '../auth/dtos/request/token-payload.dto';
import { UserNotFoundError } from './error/user-not-found.error';

import { CreateUserDto } from './dtos/request/create-user.dto';
import { UpdateUserDto } from './dtos/request/update-user.dto';
import { ResponseUpdatedUserDto } from './dtos/response/response-updated-user.dto';
import { ResponseUserDto } from './dtos/response/response-user.dto';

import { AUTH_ROUTING_KEYS } from '../constants/routing-keys';

@Injectable()
export class UserService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly hashingService: HashingServiceProtocol,
    private readonly authService: AuthService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<ResponseUserDto> {
    const passwordHash = await this.hashingService.hash(
      createUserDto.password,
    );
    const user = await this.createUserTransaction(
      passwordHash,
      createUserDto,
    );
    const nextUrl = await this.authService.getNextUrl('/reader/create');

    const accessToken = await this.authService.signJwtAsync(
      user.id!,
      this.jwtConfiguration.expiresIn,
      { username: user.username!, email: user.email! },
    );

    const refreshToken = await this.authService.signJwtAsync(
      user.id!,
      this.jwtConfiguration.refreshTokenExpiresIn,
    );

    return {
      message: 'Usuário criado com sucesso',
      data: { accessToken, refreshToken },
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
      });

      const savedUser = await manager.save(UserEntity, newUser);

      const outboxEvent = manager.create(OutboxEventEntity, {
        eventType: AUTH_ROUTING_KEYS.USER_CREATED,
        userId: savedUser.id,
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
      const currentUser = await manager.findOne(UserEntity, { where: { id } });

      if (!currentUser)
        throw new UserNotFoundError(`Usuário com ID ${id} não encontrado`);

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

      if (usernameChanged || emailChanged) {
        const outboxEvent = manager.create(OutboxEventEntity, {
          eventType: AUTH_ROUTING_KEYS.USER_UPDATED,
          userId: updatedUser.id,
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
      const currentUser = await manager.findOne(UserEntity, { where: { id } });
      if (!currentUser)
        throw new UserNotFoundError(`Usuário com ID ${id} não encontrado`);

      if (tokenPayload.sub !== currentUser.id) {
        throw new ForbiddenException(
          'Usuário não autorizado a deletar este recurso',
        );
      }

      await manager.remove(UserEntity, currentUser);

      const outboxEvent = manager.create(OutboxEventEntity, {
        eventType: AUTH_ROUTING_KEYS.USER_DELETED,
        userId: id,
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

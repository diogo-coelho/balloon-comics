import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

import { UserEntity } from "./entities/user.entity";
import { OutboxEventEntity } from "./entities/outbox-event.entity";

import { HashingServiceProtocol } from "../auth/hashing/hashing.service";
import { AuthService } from "../auth/auth.service";
import { UserNotFoundError } from "./error/user-not-found.error";

import { CreateUserDto } from "./dtos/request/create-user.dto";
import { UpdateUserDto } from "./dtos/request/update-user.dto";
import { ResponseUpdatedUserDto } from "./dtos/response/response-updated-user.dto";
import { ResponseUserDto } from "./dtos/response/response-user.dto";

@Injectable()
export class UserService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly hashingService: HashingServiceProtocol,
    private readonly authService: AuthService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<ResponseUserDto> {
    try {
      const passwordHash = await this.hashingService.hash(createUserDto.password);
      const user = await this.createUserTransaction(passwordHash, createUserDto);
      const nextUrl = await this.authService.getNextUrl('/reader/create');

      const accessToken = await this.authService.getAccessToken(
        user.id!,
        user.username!,
        user.email!,
      );

      return {
        message: 'Usuário criado com sucesso',
        data: { accessToken },
        next: nextUrl,
        statusCode: 201,
      };

    } catch (error: Error | undefined | any) {
      return Promise.reject({ 
        message: 'Erro ao tentar criar um usuário', 
        error,
        statusCode: error.status || 500
      }); 
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<ResponseUpdatedUserDto> {
    try {
      const updatedUser = await this.updateUserTransaction(id, updateUserDto);
      
      return {
        message: 'Usuário atualizado com sucesso',
        data: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        },
        statusCode: 200,
      };

    } catch (error: Error | undefined | any) {
      return Promise.reject({ 
        message: 'Erro ao tentar atualizar um usuário', 
        error,
        statusCode: error.status || 500
      }); 
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await this.deleteUserTransaction(id);
    } catch (error: Error | undefined | any) {
      return Promise.reject({ 
        message: 'Erro ao tentar deletar um usuário', 
        error,
        statusCode: error.status || 500
      });
    }
  }

  private async createUserTransaction(passwordHash: string, createUserDto: CreateUserDto): Promise<UserEntity> {
    return await this.dataSource.transaction(async (manager) => {
        const newUser = manager.create(UserEntity, {
          username: createUserDto.username,
          email: createUserDto.email,
          passwordHash,
        });

        const savedUser = await manager.save(UserEntity, newUser);

        const outboxEvent = manager.create(OutboxEventEntity, {
          eventType: 'user.created',
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

  private async updateUserTransaction(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    return await this.dataSource.transaction(async (manager) => {
      const currentUser = await manager.findOne(UserEntity, { where: { id } });

      if (!currentUser) throw new UserNotFoundError(`Usuário com ID ${id} não encontrado`);

      const usernameChanged = currentUser.username !== updateUserDto.username;
      const emailChanged = currentUser.email !== updateUserDto.email;

      currentUser.username = updateUserDto.username;
      currentUser.email = updateUserDto.email;

      if (updateUserDto.password) {
        const passwordHash = await this.hashingService.hash(updateUserDto.password);
        currentUser.passwordHash = passwordHash;
      }

      const updatedUser = await manager.save(UserEntity, currentUser);

      if (usernameChanged || emailChanged) {
        const outboxEvent = manager.create(OutboxEventEntity, {
          eventType: 'user.updated',
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

  private async deleteUserTransaction(id: string): Promise<void> {
    return await this.dataSource.transaction(async (manager) => {
      const currentUser = await manager.findOne(UserEntity, { where: { id } });
      if (!currentUser) throw new UserNotFoundError(`Usuário com ID ${id} não encontrado`);
      
      await manager.remove(UserEntity, currentUser);

      const outboxEvent = manager.create(OutboxEventEntity, {
        eventType: 'user.deleted',
        userId: id,
        payload: {
          userId: id
        },
        status: 'pending',
        attempts: 0,
      });

      await manager.save(OutboxEventEntity, outboxEvent);
    });
  }

}
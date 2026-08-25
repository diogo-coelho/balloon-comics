import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

import { UserEntity } from "./entities/user.entity";
import { OutboxEventEntity } from "./entities/outbox-event.entity";
import { ResponseUserDto } from "./dtos/response/response-user.dto";
import { CreateUserDto } from "./dtos/request/create-user.dto";
import { HashingServiceProtocol } from "../auth/hashing/hashing.service";
import { AuthService } from "../auth/auth.service";

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

      const user = await this.dataSource.transaction(async (manager) => {
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
            'user_id': savedUser.id,
            username: savedUser.username,
            email: savedUser.email,
          },
          status: 'pending',
          attempts: 0,
        });

        await manager.save(OutboxEventEntity, outboxEvent);

        return savedUser;
      });

      const accessToken = await this.authService.getAccessToken(
        user.id!,
        user.username!,
        user.email!,
      );

      const nextUrl = await this.authService.getNextUrl('/reader/create');

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
  
}